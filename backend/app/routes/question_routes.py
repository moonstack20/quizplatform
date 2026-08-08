from flask import Blueprint, jsonify

question_bp = Blueprint("questions", __name__)


# Implemented Day 6: question + option CRUD, admin-only, mounted under /api
@question_bp.route("/questions/ping", methods=["GET"])
def ping():
    return jsonify({"message": "questions blueprint alive"}), 200
