from flask import Blueprint, render_template
from db import get_db

public_bp = Blueprint('public', __name__)

@public_bp.route('/')
def home():
    return render_template('landing/home.html')

@public_bp.route('/about')
def about():
    return render_template('landing/about.html')

@public_bp.route('/services')
def services():
    return render_template('landing/services.html')

@public_bp.route('/gallery')
def gallery():
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT g.*, a.artist_name, a.specialisation
        FROM gallery g
        JOIN artist a ON g.artist_id = a.artist_id
        ORDER BY g.uploaded_at DESC
    """)
    gallery = cursor.fetchall()
    artist_count = len(set(item['artist_id'] for item in gallery))
    styles_count = len(set(item['style'] for item in gallery if item['style']))
    conn.close()
    return render_template('landing/gallery.html',
        gallery      = gallery,
        artist_count = artist_count,
        styles_count = styles_count
    )

@public_bp.route('/contact')
def contact():
    return render_template('landing/contact.html')

@public_bp.route('/update-theme', methods=['POST'])
def update_theme():
    from flask import session, request
    current_theme = session.get('theme', 'dark')
    new_theme = 'light' if current_theme == 'dark' else 'dark'
    session['theme'] = new_theme
    return {'success': True, 'theme': new_theme}
