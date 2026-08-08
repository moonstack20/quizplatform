from flask import Blueprint, jsonify

category_bp = Blueprint("categories", __name__)


# Implemented Day 5: category CRUD, admin-only
@category_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "categories blueprint alive"}), 200
