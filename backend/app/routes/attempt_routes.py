from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.decorators import student_required
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.attempt import Attempt
from app.models.answer import Answer
from app import db

attempt_bp = Blueprint("attempts", __name__)


@attempt_bp.route("/attempts/ping", methods=["GET"])
def ping():
    return jsonify({"message": "attempts blueprint alive"}), 200


@attempt_bp.route("/quizzes/<quiz_id>/start", methods=["POST"])
@student_required
def start_attempt(quiz_id):
    user_id = get_jwt_identity()
    quiz = Quiz.query.get(quiz_id)

    if not quiz or quiz.status != "PUBLISHED":
        return jsonify({"error": "quiz not found"}), 404

    if len(quiz.questions) == 0:
        return jsonify({"error": "this quiz has no questions yet"}), 400

    # Resume an existing in-progress attempt instead of creating a new one
    existing = Attempt.query.filter_by(
        quiz_id=quiz.id, user_id=user_id, status="IN_PROGRESS"
    ).first()
    if existing:
        return jsonify({"attempt": existing.to_dict()}), 200

    completed_count = Attempt.query.filter(
        Attempt.quiz_id == quiz.id,
        Attempt.user_id == user_id,
        Attempt.status.in_(["PASSED", "FAILED"]),
    ).count()

    if completed_count >= quiz.max_attempts:
        return jsonify({"error": "maximum attempts reached for this quiz"}), 403

    now = datetime.utcnow()
    attempt = Attempt(
        quiz_id=quiz.id,
        user_id=user_id,
        status="IN_PROGRESS",
        started_at=now,
        expires_at=now + timedelta(minutes=quiz.duration_minutes),
    )
    db.session.add(attempt)
    db.session.flush()

    # Pre-create blank answer rows, one per question, to track progress
    for q in quiz.questions:
        db.session.add(Answer(attempt_id=attempt.id, question_id=q.id))

    db.session.commit()

    return jsonify({"attempt": attempt.to_dict()}), 201


@attempt_bp.route("/attempts/<attempt_id>", methods=["GET"])
@student_required
def get_attempt(attempt_id):
    user_id = get_jwt_identity()
    attempt = Attempt.query.get(attempt_id)

    if not attempt or attempt.user_id != user_id:
        return jsonify({"error": "attempt not found"}), 404

    quiz = Quiz.query.get(attempt.quiz_id)
    questions = (
        Question.query.filter_by(quiz_id=quiz.id).order_by(Question.created_at.asc()).all()
    )
    answers = {a.question_id: a for a in attempt.answers}

    return jsonify({
        "attempt": attempt.to_dict(),
        "quiz": {"id": quiz.id, "title": quiz.title, "duration_minutes": quiz.duration_minutes},
        "questions": [q.to_dict(reveal_answer=False) for q in questions],
        "answers": {
            qid: a.selected_option_id for qid, a in answers.items()
        },
    }), 200


@attempt_bp.route("/attempts/<attempt_id>/answer", methods=["PATCH"])
@student_required
def save_answer(attempt_id):
    user_id = get_jwt_identity()
    attempt = Attempt.query.get(attempt_id)

    if not attempt or attempt.user_id != user_id:
        return jsonify({"error": "attempt not found"}), 404

    if attempt.status != "IN_PROGRESS":
        return jsonify({"error": "this attempt is already completed"}), 400

    if datetime.utcnow() > attempt.expires_at:
        return jsonify({"error": "this attempt has expired"}), 400

    data = request.get_json() or {}
    question_id = data.get("question_id")
    selected_option_id = data.get("selected_option_id")

    answer = Answer.query.filter_by(attempt_id=attempt.id, question_id=question_id).first()
    if not answer:
        return jsonify({"error": "question does not belong to this attempt"}), 404

    answer.selected_option_id = selected_option_id
    db.session.commit()

    return jsonify({"message": "saved"}), 200


@attempt_bp.route("/attempts", methods=["GET"])
@student_required
def list_my_attempts():
    user_id = get_jwt_identity()
    attempts = (
        Attempt.query.filter_by(user_id=user_id)
        .order_by(Attempt.started_at.desc())
        .all()
    )
    return jsonify({"attempts": [a.to_dict() for a in attempts]}), 200
@attempt_bp.route("/attempts/<attempt_id>/submit", methods=["POST"])
@student_required
def submit_attempt(attempt_id):
    user_id = get_jwt_identity()
    attempt = Attempt.query.get(attempt_id)

    if not attempt or attempt.user_id != user_id:
        return jsonify({"error": "attempt not found"}), 404

    if attempt.status != "IN_PROGRESS":
        # Already submitted (e.g. double-click, or auto-submit raced a manual submit)
        return jsonify({"attempt": attempt.to_dict()}), 200

    quiz = Quiz.query.get(attempt.quiz_id)
    now = datetime.utcnow()

    # Backend is the source of truth for expiry, never trust the client's clock.
    # If we're past expiry, we still score whatever was answered before the deadline.
    is_expired = now > attempt.expires_at
    effective_end_time = attempt.expires_at if is_expired else now

    answers = Answer.query.filter_by(attempt_id=attempt.id).all()

    total_marks = 0
    obtained_marks = 0
    correct = 0
    incorrect = 0
    unanswered = 0

    for answer in answers:
        question = Question.query.get(answer.question_id)
        total_marks += question.marks

        if answer.selected_option_id is None:
            unanswered += 1
            answer.is_correct = None
            continue

        selected_option = next(
            (o for o in question.options if o.id == answer.selected_option_id), None
        )
        is_correct = bool(selected_option and selected_option.is_correct)
        answer.is_correct = is_correct

        if is_correct:
            correct += 1
            obtained_marks += question.marks
        else:
            incorrect += 1

    percentage = round((obtained_marks / total_marks) * 100, 1) if total_marks > 0 else 0
    status = "PASSED" if percentage >= quiz.passing_score else "FAILED"
    time_taken_seconds = int((effective_end_time - attempt.started_at).total_seconds())

    attempt.score = obtained_marks
    attempt.percentage = percentage
    attempt.correct_answers = correct
    attempt.incorrect_answers = incorrect
    attempt.unanswered = unanswered
    attempt.time_taken_seconds = time_taken_seconds
    attempt.status = status
    attempt.completed_at = now

    db.session.commit()

    return jsonify({"attempt": attempt.to_dict()}), 200