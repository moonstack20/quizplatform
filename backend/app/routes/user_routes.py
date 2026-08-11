from flask import Blueprint, jsonify, request
from app.utils.decorators import admin_required
from app.models.user import User
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.attempt import Attempt
from app import db

user_bp = Blueprint("users", __name__)


@user_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "users blueprint alive"}), 200


@user_bp.route("", methods=["GET"])
@admin_required
def list_users():
    search = request.args.get("search", "").strip().lower()
    query = User.query.filter(User.role == "STUDENT")

    if search:
        query = query.filter(
            db.or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )

    users = query.order_by(User.created_at.desc()).all()

    result = []
    for u in users:
        attempts = Attempt.query.filter_by(user_id=u.id).all()
        scores = [a.percentage for a in attempts if a.percentage is not None]
        result.append({
            **u.to_dict(),
            "quizzes_attempted": len(attempts),
            "average_score": round(sum(scores) / len(scores), 1) if scores else None,
            "highest_score": max(scores) if scores else None,
        })

    return jsonify({"users": result}), 200


@user_bp.route("/<user_id>", methods=["GET"])
@admin_required
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "user not found"}), 404

    attempts = Attempt.query.filter_by(user_id=user.id).order_by(Attempt.started_at.desc()).all()

    return jsonify({
        "user": user.to_dict(),
        "attempts": [a.to_dict() for a in attempts],
    }), 200


@user_bp.route("/<user_id>/status", methods=["PATCH"])
@admin_required
def update_user_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "user not found"}), 404

    data = request.get_json() or {}
    new_status = data.get("status")

    if new_status not in ("ACTIVE", "DEACTIVATED"):
        return jsonify({"error": "status must be ACTIVE or DEACTIVATED"}), 400

    user.status = new_status
    db.session.commit()

    return jsonify({"user": user.to_dict()}), 200


@user_bp.route("/<user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "user not found"}), 404

    if user.role == "ADMIN":
        return jsonify({"error": "cannot delete an admin account"}), 403

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "user deleted"}), 200


@user_bp.route("/stats/dashboard", methods=["GET"])
@admin_required
def dashboard_stats():
    total_students = User.query.filter_by(role="STUDENT").count()
    total_quizzes = Quiz.query.count()
    published_quizzes = Quiz.query.filter_by(status="PUBLISHED").count()
    draft_quizzes = Quiz.query.filter_by(status="DRAFT").count()
    total_questions = Question.query.count()

    attempts = Attempt.query.filter(Attempt.status.in_(["PASSED", "FAILED"])).all()
    total_attempts = len(attempts)
    passed = len([a for a in attempts if a.status == "PASSED"])
    failed = len([a for a in attempts if a.status == "FAILED"])
    scores = [a.percentage for a in attempts if a.percentage is not None]
    average_score = round(sum(scores) / len(scores), 1) if scores else 0

    return jsonify({
        "total_students": total_students,
        "total_quizzes": total_quizzes,
        "published_quizzes": published_quizzes,
        "draft_quizzes": draft_quizzes,
        "total_questions": total_questions,
        "total_attempts": total_attempts,
        "average_score": average_score,
        "passed_attempts": passed,
        "failed_attempts": failed,
    }), 200
