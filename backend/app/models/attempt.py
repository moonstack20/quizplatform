import uuid
from datetime import datetime
from app import db


class Attempt(db.Model):
    __tablename__ = "attempts"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = db.Column(db.String(36), db.ForeignKey("quizzes.id"), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)

    score = db.Column(db.Integer, nullable=True)  # obtained marks
    percentage = db.Column(db.Float, nullable=True)
    correct_answers = db.Column(db.Integer, nullable=True)
    incorrect_answers = db.Column(db.Integer, nullable=True)
    unanswered = db.Column(db.Integer, nullable=True)
    time_taken_seconds = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="IN_PROGRESS")  # IN_PROGRESS | PASSED | FAILED

    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)  # backend-computed, source of truth for timer
    completed_at = db.Column(db.DateTime, nullable=True)

    answers = db.relationship("Answer", backref="attempt", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "user_id": self.user_id,
            "score": self.score,
            "percentage": self.percentage,
            "correct_answers": self.correct_answers,
            "incorrect_answers": self.incorrect_answers,
            "unanswered": self.unanswered,
            "time_taken_seconds": self.time_taken_seconds,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
