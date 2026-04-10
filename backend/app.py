import os
from datetime import timedelta
from flask import Flask, redirect, flash
from flask_mail import Mail

# ── PATH CONFIGURATION ───────────────────────────────────────
# Define root directory to clearly find frontend assets.
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

app = Flask(__name__,
            template_folder=os.path.join(BASE_DIR, 'frontend', 'templates'),
            static_folder=os.path.join(BASE_DIR, 'frontend', 'static'))

app.secret_key = "dragon_tattoos_secret_2025"
app.permanent_session_lifetime = timedelta(hours=2)

# ── MAIL CONFIG ──────────────────────────────────────────────
app.config['MAIL_SERVER']         = 'smtp.gmail.com'
app.config['MAIL_PORT']           = 587
app.config['MAIL_USE_TLS']        = True
app.config['MAIL_USERNAME']       = 'darkdragon.ink@gmail.com'
app.config['MAIL_PASSWORD']       = 'vlbtoadxslrpdkyt'
app.config['MAIL_DEFAULT_SENDER'] = ('Dragon Tattoos', 'darkdragon.ink@gmail.com')
mail = Mail(app)

# ── UPLOAD CONFIG ─────────────────────────────────────────────
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'frontend', 'static', 'uploads', 'references')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(os.path.join(BASE_DIR, 'frontend', 'static', 'uploads', 'gallery'),    exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'frontend', 'static', 'uploads', 'references'), exist_ok=True)

# ── NO CACHE AFTER LOGOUT ────────────────────────────────────
@app.after_request
def add_no_cache(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"]        = "no-cache"
    response.headers["Expires"]       = "0"
    return response

# ── DATABASE LIFECYCLE ──
@app.teardown_appcontext
def close_db(error):
    from flask import g
    db = g.get('db', None)
    if db is not None:
        db.close()

# ── ERROR HANDLERS ───────────────────────────────────────────
@app.errorhandler(404)
def page_not_found(e):
    return redirect('/')

@app.errorhandler(500)
def server_error(e):
    flash("Something went wrong. Please try again.", "error")
    return redirect('/')

# ── REGISTER BLUEPRINTS ──────────────────────────────────────
# Note: Since routes/ is now relative to this file in backend/, we can import normally.
from routes import register_blueprints
register_blueprints(app)

# ── DB MAINTENANCE ──────────────────────────────────────────
from utils.db_maintenance import ensure_schema_consistency
with app.app_context():
    ensure_schema_consistency()

if __name__ == '__main__':
    app.run(debug=True)
