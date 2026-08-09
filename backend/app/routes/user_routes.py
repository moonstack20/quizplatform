from flask import Blueprint, jsonify
from app.utils.decorators import admin_required
from app.models.user import User

user_bp = Blueprint("users", __name__)


@user_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "users blueprint alive"}), 200


# Full CRUD (search, view profile, activate/deactivate, delete) built on Day 4.
# This proves the admin-only guard works end-to-end.
@user_bp.route("", methods=["GET"])
@admin_required
def list_users():
    users = User.query.all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200
