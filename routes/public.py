from flask import Blueprint, render_template
from db import get_db

public_bp = Blueprint('public', __name__)

@public_bp.route('/')
def home():
    return render_template('landing/home.html')

@public_bp.route('/about')
def about():
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    
    # ──── DEBUG: Ensure Column and Data Exist ────
    try:
        # Check for profile_image column
        cursor.execute("SHOW COLUMNS FROM artist LIKE 'profile_image'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE artist ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL")
            conn.commit()

        # Check for artists and seed if empty
        cursor.execute("SELECT COUNT(*) as count FROM artist")
        if cursor.fetchone()['count'] == 0:
            artists_to_seed = [
                ('DRAG-ART-001', 'Arjun Mehta', 'arjun@dragon.ink', '9999999901', 'Tattoo Artist', 'pass123', 'images/artist1.jpg'),
                ('DRAG-ART-002', 'Priya Sharma', 'priya@dragon.ink', '9999999902', 'Sketch Artist', 'pass123', 'images/artist2.jpg'),
                ('DRAG-ART-003', 'Rahul Verma',   'rahul@dragon.ink',   '9999999903', 'Laser Removal Specialist', 'pass123', 'images/artist3.jpg')
            ]
            cursor.executemany(
                "INSERT INTO artist (artist_id, artist_name, artist_email, phone, specialisation, password, profile_image) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                artists_to_seed
            )
            conn.commit()
    except Exception as e:
        print(f"DEBUG: DB Maintenance failed: {e}")

    cursor.execute("SELECT * FROM artist ORDER BY artist_name")
    artists = cursor.fetchall()
    conn.close()
    return render_template('landing/about.html', artists=artists)

@public_bp.route('/debug/db')
def debug_db():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM artist")
    artists = cursor.fetchall()
    conn.close()
    return f"Artists in DB: {artists}"

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
