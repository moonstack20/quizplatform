from flask import Blueprint, jsonify, request
from sqlalchemy import func
from flask_jwt_extended import jwt_required
from app.models.attempt import Attempt
from app.models.user import User
from app import db

leaderboard_bp = Blueprint("leaderboard", __name__)


# Implemented Day 12: overall + category-wise ranking
@leaderboard_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "leaderboard blueprint alive"}), 200


@leaderboard_bp.route("", methods=["GET"])
@jwt_required()
def global_leaderboard():
    limit = request.args.get("limit", 10, type=int)

    rows = (
        db.session.query(
            User.id,
            User.name,
            func.count(Attempt.id).label("attempts_taken"),
            func.avg(Attempt.percentage).label("avg_percentage"),
        )
        .join(Attempt, Attempt.user_id == User.id)
        .filter(Attempt.status.in_(["PASSED", "FAILED"]))
        .group_by(User.id, User.name)
        .order_by(func.avg(Attempt.percentage).desc())
        .limit(limit)
        .all()
    )

    leaderboard = [
        {
            "rank": idx + 1,
            "user_id": row.id,
            "name": row.name,
            "attempts_taken": row.attempts_taken,
            "average_score": round(row.avg_percentage, 1) if row.avg_percentage is not None else 0,
        }
        for idx, row in enumerate(rows)
    ]

    return jsonify({"leaderboard": leaderboard}), 200
