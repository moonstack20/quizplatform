from flask import Blueprint, jsonify, request
from app.utils.decorators import admin_required
from app.models.question import Question
from app.models.option import Option
from app.models.quiz import Quiz
from app import db

question_bp = Blueprint("questions", __name__)


@question_bp.route("/quizzes/<quiz_id>/questions", methods=["GET"])
@admin_required
def list_questions(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "quiz not found"}), 404

    return jsonify({
        "questions": [q.to_dict(reveal_answer=True) for q in quiz.questions]
    }), 200


@question_bp.route("/quizzes/<quiz_id>/questions", methods=["POST"])
@admin_required
def create_question(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "quiz not found"}), 404

    data = request.get_json() or {}
    question_text = data.get("question_text", "").strip()
    options = data.get("options", [])

    if not question_text:
        return jsonify({"error": "question_text is required"}), 400

    if len(options) < 2:
        return jsonify({"error": "at least 2 options are required"}), 400

    correct_count = sum(1 for o in options if o.get("is_correct"))
    if correct_count != 1:
        return jsonify({"error": "exactly one option must be marked correct"}), 400

    for o in options:
        if not o.get("option_text", "").strip():
            return jsonify({"error": "option_text cannot be empty"}), 400

    question = Question(
        quiz_id=quiz.id,
        question_text=question_text,
        marks=data.get("marks", 1),
        explanation=data.get("explanation", "").strip(),
        difficulty=data.get("difficulty", "EASY"),
    )
    db.session.add(question)
    db.session.flush()  # get question.id before commit

    for o in options:
        option = Option(
            question_id=question.id,
            option_text=o["option_text"].strip(),
            is_correct=bool(o.get("is_correct")),
        )
        db.session.add(option)

    db.session.commit()

    return jsonify({"question": question.to_dict(reveal_answer=True)}), 201


@question_bp.route("/questions/<question_id>", methods=["PUT"])
@admin_required
def update_question(question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({"error": "question not found"}), 404

    data = request.get_json() or {}
    question_text = data.get("question_text", "").strip()
    options = data.get("options", [])

    if not question_text:
        return jsonify({"error": "question_text is required"}), 400

    if len(options) < 2:
        return jsonify({"error": "at least 2 options are required"}), 400

    correct_count = sum(1 for o in options if o.get("is_correct"))
    if correct_count != 1:
        return jsonify({"error": "exactly one option must be marked correct"}), 400

    for o in options:
        if not o.get("option_text", "").strip():
            return jsonify({"error": "option_text cannot be empty"}), 400

    question.question_text = question_text
    question.marks = data.get("marks", question.marks)
    question.explanation = data.get("explanation", "").strip()
    question.difficulty = data.get("difficulty", question.difficulty)

    # Replace all options wholesale (simpler and safer than diffing)
    Option.query.filter_by(question_id=question.id).delete()
    for o in options:
        option = Option(
            question_id=question.id,
            option_text=o["option_text"].strip(),
            is_correct=bool(o.get("is_correct")),
        )
        db.session.add(option)

    db.session.commit()

    return jsonify({"question": question.to_dict(reveal_answer=True)}), 200


@question_bp.route("/questions/<question_id>", methods=["DELETE"])
@admin_required
def delete_question(question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({"error": "question not found"}), 404

    db.session.delete(question)
    db.session.commit()

    return jsonify({"message": "question deleted"}), 200
