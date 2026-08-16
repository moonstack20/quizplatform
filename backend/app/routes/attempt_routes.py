from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.decorators import student_required
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.attempt import Attempt
from app.models.answer import Answer
from app import db
from io import BytesIO
from flask import send_file
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas


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
@attempt_bp.route("/attempts/<attempt_id>/review", methods=["GET"])
@student_required
def review_attempt(attempt_id):
    user_id = get_jwt_identity()
    attempt = Attempt.query.get(attempt_id)

    if not attempt or attempt.user_id != user_id:
        return jsonify({"error": "attempt not found"}), 404

    if attempt.status == "IN_PROGRESS":
        return jsonify({"error": "this attempt has not been submitted yet"}), 400

    quiz = Quiz.query.get(attempt.quiz_id)
    answers = Answer.query.filter_by(attempt_id=attempt.id).all()

    review = []
    for answer in answers:
        question = Question.query.get(answer.question_id)
        review.append({
            "question_text": question.question_text,
            "question_id": question.id,
            "question_text": question.question_text,
            "explanation": question.explanation,
            "marks": question.marks,
            "is_correct": answer.is_correct,
            "options": [
                {
                    "id": o.id,
                    "option_text": o.option_text,
                    "is_correct": o.is_correct,
                    "was_selected": o.id == answer.selected_option_id,
                }
                for o in question.options
            ],
        })

    return jsonify({
        "attempt": attempt.to_dict(),
        "quiz_title": quiz.title,
        "review": review,
    }), 200


@attempt_bp.route("/attempts/stats/dashboard", methods=["GET"])
@student_required
def student_dashboard_stats():
    user_id = get_jwt_identity()
    attempts = Attempt.query.filter(
        Attempt.user_id == user_id,
        Attempt.status.in_(["PASSED", "FAILED"]),
    ).all()

    total_attempted = len(attempts)
    passed = len([a for a in attempts if a.status == "PASSED"])
    failed = len([a for a in attempts if a.status == "FAILED"])
    scores = [a.percentage for a in attempts if a.percentage is not None]
    average_score = round(sum(scores) / len(scores), 1) if scores else 0
    highest_score = max(scores) if scores else 0
    total_questions_answered = sum(
        (a.correct_answers or 0) + (a.incorrect_answers or 0) for a in attempts
    )

    return jsonify({
        "quizzes_attempted": total_attempted,
        "quizzes_passed": passed,
        "quizzes_failed": failed,
        "average_score": average_score,
        "highest_score": highest_score,
        "total_questions_answered": total_questions_answered,
    }), 200
@attempt_bp.route("/attempts/<attempt_id>/tab-switch", methods=["PATCH"])
@student_required
def record_tab_switch(attempt_id):
    user_id = get_jwt_identity()
    attempt = Attempt.query.get(attempt_id)

    if not attempt or attempt.user_id != user_id:
        return jsonify({"error": "attempt not found"}), 404

    if attempt.status != "IN_PROGRESS":
        return jsonify({"message": "attempt already completed"}), 200

    attempt.tab_switch_count += 1
    db.session.commit()

    return jsonify({"tab_switch_count": attempt.tab_switch_count}), 200
@attempt_bp.route("/attempts/<attempt_id>/certificate", methods=["GET"])
@student_required
def download_certificate(attempt_id):
    import math
    from reportlab.lib.pagesizes import letter

    user_id = get_jwt_identity()
    attempt = Attempt.query.get(attempt_id)

    if not attempt or attempt.user_id != user_id:
        return jsonify({"error": "attempt not found"}), 404

    if attempt.status != "PASSED":
        return jsonify({"error": "certificate only available for passed attempts"}), 400

    from app.models.user import User
    quiz = Quiz.query.get(attempt.quiz_id)
    user = User.query.get(user_id)

    buffer = BytesIO()
    page_size = letter  # portrait, like the reference
    c = canvas.Canvas(buffer, pagesize=page_size)
    width, height = page_size

    navy = HexColor("#1e3a5f")
    slate = HexColor("#475569")
    light_slate = HexColor("#94a3b8")
    ribbon_bg = HexColor("#e8ecf3")
    gold = HexColor("#b8860b")

    # Outer thin border
    c.setStrokeColor(HexColor("#cbd5e1"))
    c.setLineWidth(1)
    c.rect(28, 28, width - 56, height - 56)

    margin_left = 65
    content_width = width - 260  # leave room for ribbon on the right

    # "Logo" / platform wordmark, top-left
    c.setFont("Helvetica-Bold", 22)
    c.setFillColor(navy)
    c.drawString(margin_left, height - 90, "QuizPlatform")
    c.setFont("Helvetica", 9)
    c.setFillColor(light_slate)
    c.drawString(margin_left + 1, height - 104, "ONLINE ASSESSMENT")

    # Date
    c.setFont("Helvetica", 10)
    c.setFillColor(slate)
    date_str = attempt.completed_at.strftime("%b %d, %Y") if attempt.completed_at else ""
    c.drawString(margin_left, height - 160, date_str)

    # Name, large serif
    c.setFont("Times-Roman", 30)
    c.setFillColor(HexColor("#1e293b"))
    c.drawString(margin_left, height - 200, user.name)

    # "has successfully completed"
    c.setFont("Helvetica", 11)
    c.setFillColor(slate)
    c.drawString(margin_left, height - 228, "has successfully passed the assessment")

    # Quiz title
    c.setFont("Times-Bold", 18)
    c.setFillColor(navy)
    c.drawString(margin_left, height - 258, quiz.title)

    # Description line
    c.setFont("Helvetica", 10)
    c.setFillColor(slate)
    desc = f"an online quiz assessment scored {attempt.percentage}%, offered through Quiz Platform"
    c.drawString(margin_left, height - 280, desc)

    # Stats row
    stats_y = height - 320
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(navy)
    c.drawString(margin_left, stats_y, f"Score: {attempt.percentage}%")
    c.drawString(margin_left + 130, stats_y, f"Correct: {attempt.correct_answers}/{attempt.correct_answers + attempt.incorrect_answers + attempt.unanswered}")
    c.drawString(margin_left + 280, stats_y, f"Time: {attempt.time_taken_seconds // 60}m {attempt.time_taken_seconds % 60}s")

    # Signature block, bottom-left
    sig_y = 130
    c.setFont("Times-Italic", 20)
    c.setFillColor(navy)
    c.drawString(margin_left, sig_y + 28, "Q. Platform")
    c.setStrokeColor(light_slate)
    c.setLineWidth(0.75)
    c.line(margin_left, sig_y + 16, margin_left + 200, sig_y + 16)
    c.setFont("Helvetica", 9)
    c.setFillColor(slate)
    c.drawString(margin_left, sig_y, "Quiz Platform")
    c.drawString(margin_left, sig_y - 12, "Automated Assessment System")

    # Footer disclaimer
    c.setFont("Helvetica", 7.5)
    c.setFillColor(light_slate)
    footer_text = "This certificate attests to the learner's completion of an online quiz assessment on Quiz Platform."
    c.drawCentredString((margin_left + content_width) / 2 + 20, 55, footer_text)
    c.drawCentredString(
        (margin_left + content_width) / 2 + 20, 44,
        f"Verify at quizplatform.local/verify/{attempt.id[:8]}"
    )

    # --- Vertical ribbon banner, right side ---
    ribbon_left = width - 180
    ribbon_right = width - 60
    ribbon_top = height - 40
    ribbon_bottom = 280
    notch_depth = 40

    c.setFillColor(ribbon_bg)
    p = c.beginPath()
    p.moveTo(ribbon_left, ribbon_top)
    p.lineTo(ribbon_right, ribbon_top)
    p.lineTo(ribbon_right, ribbon_bottom)
    p.lineTo((ribbon_left + ribbon_right) / 2, ribbon_bottom - notch_depth)
    p.lineTo(ribbon_left, ribbon_bottom)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

    # Ribbon text
    ribbon_center_x = (ribbon_left + ribbon_right) / 2
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(navy)
    c.drawCentredString(ribbon_center_x, ribbon_top - 35, "QUIZ")
    c.drawCentredString(ribbon_center_x, ribbon_top - 50, "CERTIFICATE")

    # Circular seal within the ribbon
    seal_cx = ribbon_center_x
    seal_cy = (ribbon_top + ribbon_bottom) / 2 - 10
    seal_r = 48

    # Dotted outer ring
    c.setFillColor(gold)
    num_dots = 40
    for i in range(num_dots):
        angle = 2 * math.pi * i / num_dots
        dot_x = seal_cx + (seal_r + 6) * math.cos(angle)
        dot_y = seal_cy + (seal_r + 6) * math.sin(angle)
        c.circle(dot_x, dot_y, 0.8, fill=1, stroke=0)

    # Inner solid circle
    c.setFillColor(HexColor("#ffffff"))
    c.setStrokeColor(gold)
    c.setLineWidth(1.5)
    c.circle(seal_cx, seal_cy, seal_r, fill=1, stroke=1)
    c.setStrokeColor(navy)
    c.setLineWidth(0.5)
    c.circle(seal_cx, seal_cy, seal_r - 6, fill=0, stroke=1)

    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(navy)
    c.drawCentredString(seal_cx, seal_cy + 14, "PASSED")
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(seal_cx, seal_cy - 5, f"{int(attempt.percentage)}%")
    c.setFont("Helvetica", 6.5)
    c.setFillColor(slate)
    c.drawCentredString(seal_cx, seal_cy - 22, "VERIFIED SCORE")

    c.save()
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"certificate-{quiz.title.replace(' ', '-')}.pdf",
    )
@attempt_bp.route("/attempts/stats/by-category", methods=["GET"])
@student_required
def stats_by_category():
    from app.models.category import Category

    user_id = get_jwt_identity()

    results = (
        db.session.query(
            Category.name,
            db.func.avg(Attempt.percentage).label("average_score"),
            db.func.count(Attempt.id).label("attempts"),
        )
        .join(Quiz, Quiz.category_id == Category.id)
        .join(Attempt, Attempt.quiz_id == Quiz.id)
        .filter(
            Attempt.user_id == user_id,
            Attempt.status.in_(["PASSED", "FAILED"]),
        )
        .group_by(Category.id, Category.name)
        .all()
    )

    categories = [
        {
            "category": name,
            "average_score": round(float(avg), 1),
            "attempts": count,
        }
        for name, avg, count in results
    ]

    categories.sort(key=lambda c: c["average_score"])

    return jsonify({
        "categories": categories,
        "weakest": categories[0] if categories else None,
        "strongest": categories[-1] if len(categories) > 1 else None,
    }), 200
@attempt_bp.route("/questions/<question_id>/explain", methods=["POST"])
@student_required
def generate_explanation(question_id):
    from groq import Groq
    from flask import current_app

    question = Question.query.get(question_id)
    if not question:
        return jsonify({"error": "question not found"}), 404

    # If the admin already wrote an explanation, just return it — no need to call the AI
    if question.explanation and question.explanation.strip():
        return jsonify({"explanation": question.explanation, "source": "admin"}), 200

    correct_option = next((o for o in question.options if o.is_correct), None)
    if not correct_option:
        return jsonify({"error": "no correct option found for this question"}), 400

    options_text = "\n".join(f"- {o.option_text}" for o in question.options)

    prompt = (
        f"Question: {question.question_text}\n"
        f"Options:\n{options_text}\n"
        f"Correct answer: {correct_option.option_text}\n\n"
        "Write a short, clear explanation (2-3 sentences max) of why this is the correct answer. "
        "Do not repeat the question. Be direct and educational, suitable for a student reviewing "
        "a quiz result."
    )

    try:
        client = Groq(api_key=current_app.config["GROQ_API_KEY"])
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.5,
        )
        explanation = response.choices[0].message.content.strip()
    except Exception as e:
        return jsonify({"error": "could not generate explanation", "detail": str(e)}), 502

    return jsonify({"explanation": explanation, "source": "ai"}), 200
