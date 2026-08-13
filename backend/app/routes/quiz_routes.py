from flask import Blueprint, jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt, jwt_required
from app.utils.decorators import admin_required
from app.models.quiz import Quiz
from app import db

quiz_bp = Blueprint("quizzes", __name__)


def _is_admin():
    try:
        verify_jwt_in_request(optional=True)
        claims = get_jwt()
        return claims.get("role") == "ADMIN"
    except Exception:
        return False


@quiz_bp.route("", methods=["GET"])
def list_quizzes():
    query = Quiz.query

    if not _is_admin():
        query = query.filter_by(status="PUBLISHED")
    else:
        status = request.args.get("status")
        if status:
            query = query.filter_by(status=status)

    category_id = request.args.get("category_id")
    if category_id:
        query = query.filter_by(category_id=category_id)

    difficulty = request.args.get("difficulty")
    if difficulty:
        query = query.filter_by(difficulty=difficulty)

    search = request.args.get("search", "").strip()
    if search:
        query = query.filter(Quiz.title.ilike(f"%{search}%"))

    quizzes = query.order_by(Quiz.created_at.desc()).all()
    return jsonify({"quizzes": [q.to_dict() for q in quizzes]}), 200


@quiz_bp.route("/<quiz_id>", methods=["GET"])
def get_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "quiz not found"}), 404

    if quiz.status != "PUBLISHED" and not _is_admin():
        return jsonify({"error": "quiz not found"}), 404

    return jsonify({"quiz": quiz.to_dict(include_questions=_is_admin())}), 200


@quiz_bp.route("", methods=["POST"])
@admin_required
def create_quiz():
    data = request.get_json() or {}
    title = data.get("title", "").strip()

    if not title:
        return jsonify({"error": "title is required"}), 400

    quiz = Quiz(
        title=title,
        description=data.get("description", "").strip(),
        category_id=data.get("category_id"),
        difficulty=data.get("difficulty", "BEGINNER"),
        duration_minutes=data.get("duration_minutes", 10),
        passing_score=data.get("passing_score", 60),
        max_attempts=data.get("max_attempts", 1),
        status="DRAFT",
        thumbnail_url=data.get("thumbnail_url"),
    )
    db.session.add(quiz)
    db.session.commit()

    return jsonify({"quiz": quiz.to_dict()}), 201


@quiz_bp.route("/<quiz_id>", methods=["PUT"])
@admin_required
def update_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "quiz not found"}), 404

    data = request.get_json() or {}
    title = data.get("title", "").strip()

    if not title:
        return jsonify({"error": "title is required"}), 400

    quiz.title = title
    quiz.description = data.get("description", "").strip()
    quiz.category_id = data.get("category_id")
    quiz.difficulty = data.get("difficulty", quiz.difficulty)
    quiz.duration_minutes = data.get("duration_minutes", quiz.duration_minutes)
    quiz.passing_score = data.get("passing_score", quiz.passing_score)
    quiz.max_attempts = data.get("max_attempts", quiz.max_attempts)
    quiz.thumbnail_url = data.get("thumbnail_url", quiz.thumbnail_url)

    db.session.commit()

    return jsonify({"quiz": quiz.to_dict()}), 200


@quiz_bp.route("/<quiz_id>", methods=["DELETE"])
@admin_required
def delete_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "quiz not found"}), 404

    db.session.delete(quiz)
    db.session.commit()

    return jsonify({"message": "quiz deleted"}), 200


@quiz_bp.route("/<quiz_id>/publish", methods=["PATCH"])
@admin_required
def toggle_publish(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "quiz not found"}), 404

    data = request.get_json() or {}
    new_status = data.get("status")

    if new_status not in ("DRAFT", "PUBLISHED", "UNPUBLISHED"):
        return jsonify({"error": "status must be DRAFT, PUBLISHED, or UNPUBLISHED"}), 400

    if new_status == "PUBLISHED" and len(quiz.questions) == 0:
        return jsonify({"error": "cannot publish a quiz with no questions"}), 400

    quiz.status = new_status
    db.session.commit()

    return jsonify({"quiz": quiz.to_dict()}), 200
