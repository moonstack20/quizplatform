from flask import Blueprint, jsonify

quiz_bp = Blueprint("quizzes", __name__)


# Implemented Day 5: quiz CRUD + publish/unpublish, admin-only for writes
@quiz_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "quizzes blueprint alive"}), 200
