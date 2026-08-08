from flask import Blueprint, jsonify

auth_bp = Blueprint("auth", __name__)


# Implemented Day 2: register, login, logout, JWT issuing, password hashing
@auth_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "auth blueprint alive"}), 200
