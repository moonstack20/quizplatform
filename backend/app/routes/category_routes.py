from flask import Blueprint, jsonify, request
from app.utils.decorators import admin_required
from app.models.category import Category
from app import db

category_bp = Blueprint("categories", __name__)


@category_bp.route("", methods=["GET"])
def list_categories():
    categories = Category.query.order_by(Category.name.asc()).all()
    return jsonify({"categories": [c.to_dict() for c in categories]}), 200


@category_bp.route("", methods=["POST"])
@admin_required
def create_category():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()

    if not name:
        return jsonify({"error": "name is required"}), 400

    existing = Category.query.filter_by(name=name).first()
    if existing:
        return jsonify({"error": "a category with this name already exists"}), 409

    category = Category(name=name, description=description)
    db.session.add(category)
    db.session.commit()

    return jsonify({"category": category.to_dict()}), 201


@category_bp.route("/<category_id>", methods=["PUT"])
@admin_required
def update_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "category not found"}), 404

    data = request.get_json() or {}
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()

    if not name:
        return jsonify({"error": "name is required"}), 400

    category.name = name
    category.description = description
    db.session.commit()

    return jsonify({"category": category.to_dict()}), 200


@category_bp.route("/<category_id>", methods=["DELETE"])
@admin_required
def delete_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "category not found"}), 404

    if category.quizzes:
        return jsonify({"error": "cannot delete a category that has quizzes"}), 409

    db.session.delete(category)
    db.session.commit()

    return jsonify({"message": "category deleted"}), 200
