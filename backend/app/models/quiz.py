import uuid
from datetime import datetime
from app import db


class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category_id = db.Column(db.String(36), db.ForeignKey("categories.id"), nullable=True)
    difficulty = db.Column(db.String(20), nullable=False, default="BEGINNER")  # BEGINNER | INTERMEDIATE | ADVANCED
    duration_minutes = db.Column(db.Integer, nullable=False, default=10)
    passing_score = db.Column(db.Integer, nullable=False, default=60)  # percentage
    max_attempts = db.Column(db.Integer, nullable=False, default=1)
    status = db.Column(db.String(20), nullable=False, default="DRAFT")  # DRAFT | PUBLISHED | UNPUBLISHED
    thumbnail_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    questions = db.relationship("Question", backref="quiz", lazy=True, cascade="all, delete-orphan")
    attempts = db.relationship("Attempt", backref="quiz", lazy=True)

    def to_dict(self, include_questions=False):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category_id": self.category_id,
            "difficulty": self.difficulty,
            "duration_minutes": self.duration_minutes,
            "passing_score": self.passing_score,
            "max_attempts": self.max_attempts,
            "status": self.status,
            "thumbnail_url": self.thumbnail_url,
            "question_count": len(self.questions),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_questions:
            data["questions"] = [q.to_dict() for q in self.questions]
        return data
