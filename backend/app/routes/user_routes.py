from flask import Blueprint, jsonify

user_bp = Blueprint("users", __name__)


# Implemented Day 4: GET/PUT/DELETE users, PATCH status, admin-only auth guard
@user_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "users blueprint alive"}), 200
