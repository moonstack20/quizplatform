import uuid
from app import db


class Answer(db.Model):
    __tablename__ = "answers"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attempt_id = db.Column(db.String(36), db.ForeignKey("attempts.id"), nullable=False)
    question_id = db.Column(db.String(36), db.ForeignKey("questions.id"), nullable=False)
    selected_option_id = db.Column(db.String(36), db.ForeignKey("options.id"), nullable=True)
    is_correct = db.Column(db.Boolean, nullable=True)  # computed by backend on submission

    def to_dict(self):
        return {
            "id": self.id,
            "attempt_id": self.attempt_id,
            "question_id": self.question_id,
            "selected_option_id": self.selected_option_id,
            "is_correct": self.is_correct,
        }
