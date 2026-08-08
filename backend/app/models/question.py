import uuid
from datetime import datetime
from app import db


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = db.Column(db.String(36), db.ForeignKey("quizzes.id"), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    marks = db.Column(db.Integer, nullable=False, default=1)
    explanation = db.Column(db.Text, nullable=True)
    difficulty = db.Column(db.String(20), nullable=False, default="EASY")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    options = db.relationship("Option", backref="question", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, reveal_answer=False):
        data = {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "question_text": self.question_text,
            "marks": self.marks,
            "difficulty": self.difficulty,
            "options": [o.to_dict(reveal_answer=reveal_answer) for o in self.options],
        }
        # explanation and correct answer only revealed after submission / to admin
        if reveal_answer:
            data["explanation"] = self.explanation
        return data
