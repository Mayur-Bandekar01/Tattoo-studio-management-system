# Routes Module
from .public import public_bp
from .auth import auth_bp
from .customer import customer_bp
from .artist import artist_bp
from .owner import owner_bp
from .chat import chat_bp

def register_blueprints(app):
    app.register_blueprint(public_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(artist_bp)
    app.register_blueprint(owner_bp)
    app.register_blueprint(chat_bp)
