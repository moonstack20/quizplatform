from flask import Blueprint, jsonify
from sqlalchemy import func
from app.utils.decorators import admin_required
from app.models.attempt import Attempt
from app.models.quiz import Quiz
from app import db

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/analytics", methods=["GET"])
@admin_required
def quiz_analytics():
    rows = (
        db.session.query(
            Quiz.id,
            Quiz.title,
            func.count(Attempt.id).label("attempt_count"),
            func.avg(Attempt.percentage).label("avg_percentage"),
        )
        .outerjoin(Attempt, Attempt.quiz_id == Quiz.id)
        .group_by(Quiz.id, Quiz.title)
        .order_by(Quiz.title.asc())
        .all()
    )

    data = [
        {
            "quiz_id": row.id,
            "title": row.title,
            "attempts": row.attempt_count,
            "average_score": round(row.avg_percentage, 1) if row.avg_percentage is not None else 0,
        }
        for row in rows
    ]

    return jsonify({"analytics": data}), 200
