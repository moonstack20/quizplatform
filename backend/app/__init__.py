import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", 60))
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_ORIGIN", "*")}})

    # Import models so Flask-Migrate can detect them
    from app.models import user, category, quiz, question, option, attempt, answer  # noqa: F401

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    from app.routes.category_routes import category_bp
    from app.routes.quiz_routes import quiz_bp
    from app.routes.question_routes import question_bp
    from app.routes.attempt_routes import attempt_bp
    from app.routes.leaderboard_routes import leaderboard_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(category_bp, url_prefix="/api/categories")
    app.register_blueprint(quiz_bp, url_prefix="/api/quizzes")
    app.register_blueprint(question_bp, url_prefix="/api")
    app.register_blueprint(attempt_bp, url_prefix="/api")
    app.register_blueprint(leaderboard_bp, url_prefix="/api/leaderboard")

    @app.route("/api/health")
    def health():
        return {"status": "ok"}, 200

    return app
