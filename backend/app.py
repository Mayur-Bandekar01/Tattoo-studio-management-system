import os
from datetime import timedelta
from flask import Flask, redirect, flash, request
from flask_mail import Mail
from flask_wtf.csrf import CSRFProtect
from dotenv import load_dotenv

# ── PATH CONFIGURATION ───────────────────────────────────────
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Load environment variables explicitly from backend
load_dotenv(os.path.join(BASE_DIR, "backend", ".env"))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "frontend", "templates"),
    static_folder=os.path.join(BASE_DIR, "frontend", "static"),
)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.jinja_env.auto_reload = True
# Debug set to False for production-ready state

# ── SECURITY CONFIGURATION ───────────────────────────────────
app.secret_key = os.getenv("SECRET_KEY")
if not app.secret_key:
    # Force runtime error in production, allow no fallback in dev to ensure .env is used
    raise RuntimeError(
        "CRITICAL: SECRET_KEY is not set in environment or .env. Secure starting requires a valid key."
    )
app.permanent_session_lifetime = timedelta(hours=2)

# CSRF Protection (Global)
csrf = CSRFProtect(app)

# Global Payload Limit (Stop DoS at server level)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB Limit

# ── MAIL CONFIG ──────────────────────────────────────────────
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = ("Dragon Tattoos", os.getenv("MAIL_USERNAME"))
mail = Mail(app)

# ── UPLOAD CONFIG ─────────────────────────────────────────────
UPLOAD_FOLDER = os.path.join(BASE_DIR, "frontend", "static", "uploads", "references")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Ensure upload directories exist
os.makedirs(
    os.path.join(BASE_DIR, "frontend", "static", "uploads", "gallery"), exist_ok=True
)
os.makedirs(
    os.path.join(BASE_DIR, "frontend", "static", "uploads", "references"), exist_ok=True
)



# ── NO CACHE AFTER LOGOUT ────────────────────────────────────
@app.after_request
def add_no_cache(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


# ── DATABASE LIFECYCLE ──
@app.teardown_appcontext
def close_db(error):
    from flask import g

    db = g.pop("db", None)
    if db is not None:
        try:
            db.close()
        except Exception:
            pass


# ── ERROR HANDLERS ───────────────────────────────────────────
@app.errorhandler(404)
def page_not_found(e):
    return redirect("/")


@app.errorhandler(500)
def server_error(e):
    flash("Something went wrong. Please try again.", "error")
    return redirect("/")


# ── REGISTER BLUEPRINTS ──────────────────────────────────────
from .routes import register_blueprints

register_blueprints(app)

# ── DB MAINTENANCE ──────────────────────────────────────────
from .utils.db_maintenance import ensure_schema_consistency

with app.app_context():
    ensure_schema_consistency()

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
