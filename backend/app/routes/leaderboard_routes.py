from flask import Blueprint, jsonify

leaderboard_bp = Blueprint("leaderboard", __name__)


# Implemented Day 12: overall + category-wise ranking
@leaderboard_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "leaderboard blueprint alive"}), 200
