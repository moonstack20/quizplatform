import uuid
from app import db


class Option(db.Model):
    __tablename__ = "options"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = db.Column(db.String(36), db.ForeignKey("questions.id"), nullable=False)
    option_text = db.Column(db.String(500), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False, default=False)

    def to_dict(self, reveal_answer=False):
        data = {
            "id": self.id,
            "question_id": self.question_id,
            "option_text": self.option_text,
        }
        # NEVER send is_correct to students while they're attempting a quiz
        if reveal_answer:
            data["is_correct"] = self.is_correct
        return data
