from flask import Blueprint, render_template, session, request
from ..db import get_db

public_bp = Blueprint("public", __name__)


@public_bp.route("/")
def home():
    return render_template("landing/home.html")


@public_bp.route("/about")
def about():
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM artist ORDER BY artist_name")
        artists = cursor.fetchall()
    return render_template("landing/about.html", artists=artists)


@public_bp.route("/services")
def services():
    return render_template("landing/services.html")


@public_bp.route("/gallery")
def gallery():
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT g.*, a.artist_name, a.specialisation
            FROM gallery g
            JOIN artist a ON g.artist_id = a.artist_id
            ORDER BY g.uploaded_at DESC
        """)
        gallery = cursor.fetchall()
    artist_count = len(set(item["artist_id"] for item in gallery))
    styles_count = len(set(item["style"] for item in gallery if item["style"]))
    return render_template(
        "landing/gallery.html",
        gallery=gallery,
        artist_count=artist_count,
        styles_count=styles_count,
    )


@public_bp.route("/contact")
def contact():
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT artist_id, artist_name FROM artist ORDER BY artist_name")
        artists = cursor.fetchall()
    return render_template("landing/contact.html", artists=artists)


@public_bp.route("/update-theme", methods=["POST"])
def update_theme():
    from flask import session, request

    current_theme = session.get("theme", "dark")
    new_theme = "light" if current_theme == "dark" else "dark"
    session["theme"] = new_theme
    return {"success": True, "theme": new_theme}


@public_bp.route("/api/inquiry", methods=["POST"])
def submit_inquiry():
    """Endpoint for public users to submit specialist inquiries."""
    data = request.get_json()
    if not data:
        return {"status": "error", "message": "No data provided"}, 400

    full_name = data.get("full_name")
    email = data.get("email")
    phone = data.get("phone")
    inquiry_type = data.get("inquiry_type")
    message = data.get("message")

    if not all([full_name, email, phone, inquiry_type, message]):
        return {"status": "error", "message": "Missing required fields"}, 400

    # Strict Validation
    import re
    # Loosened Validation (Allow common providers)
    if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email):
        return {"status": "error", "message": "Please use a valid email address."}, 400
    
    if not re.match(r'^[5-9]\d{9}$', phone):
        return {"status": "error", "message": "Phone number must be 10 digits and start with 5, 6, 7, 8, or 9."}, 400

    artist_id = data.get("artist_id")
    if not artist_id:
        artist_id = None

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        try:
            # 1. Save to database
            cursor.execute("""
                INSERT INTO inquiry (full_name, email, phone, inquiry_type, message, artist_id)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (full_name, email, phone, inquiry_type, message, artist_id))
            conn.commit()

            # 2. Trigger notifications
            from ..app import mail
            from ..utils.email_service import send_inquiry_notification

            inquiry_details = {
                "name": full_name,
                "email": email,
                "phone": phone,
                "type": inquiry_type,
                "message": message
            }

            # Fetch recipients
            recipients = []
            
            # Fetch Owner Email
            cursor.execute("SELECT email FROM owner LIMIT 1")
            owner = cursor.fetchone()
            if owner:
                recipients.append(owner["email"])

            # Fetch Artist Email if targeted
            if artist_id:
                cursor.execute("SELECT artist_email FROM artist WHERE artist_id = %s", (artist_id,))
                artist = cursor.fetchone()
                if artist and artist["artist_email"]:
                    recipients.append(artist["artist_email"])

            # Send emails
            for r_email in set(recipients): # Deduplicate if owner is also an artist
                send_inquiry_notification(mail, r_email, inquiry_details)

            return {"status": "success", "message": "Inquiry submitted! We will contact you soon."}, 201
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500
