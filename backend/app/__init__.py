from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config import Config
from app.models import db

migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    @app.route('/')
    def health_check():
        return jsonify({
            "status": "online",
            "message": "Bienvenue sur l'API de Gestion des Notes",
            "version": "1.0.0"
        }), 200

    # Enregistrement des Blueprints
    from app.routes.auth import auth_bp
    from app.routes.etudiants import etudiants_bp
    from app.routes.notes import notes_bp
    from app.routes.stats import stats_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(etudiants_bp, url_prefix='/api/etudiants')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')

    return app
