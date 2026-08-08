from flask import Blueprint, jsonify

attempt_bp = Blueprint("attempts", __name__)


# Implemented Day 7-8: start attempt, submit attempt, backend timer + scoring
@attempt_bp.route("/attempts/ping", methods=["GET"])
def ping():
    return jsonify({"message": "attempts blueprint alive"}), 200
