# ── IMPORTS ──────────────────────────────────────────────────
from flask import Flask, render_template, request, redirect, session, flash
from flask_mail import Mail, Message
from db import get_db
from datetime import timedelta, datetime
import random
import os
import time
import json
from werkzeug.utils import secure_filename

# ── APP SETUP ────────────────────────────────────────────────
app = Flask(__name__)
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
UPLOAD_FOLDER = os.path.join('static', 'uploads', 'references')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(os.path.join('static', 'uploads', 'gallery'),    exist_ok=True)
os.makedirs(os.path.join('static', 'uploads', 'references'), exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}

# ── NO CACHE AFTER LOGOUT ────────────────────────────────────
@app.after_request
def add_no_cache(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"]        = "no-cache"
    response.headers["Expires"]       = "0"
    return response

# ════════════════════════════════════════════════════════════
#  LANDING PAGES
# ════════════════════════════════════════════════════════════

@app.route('/')
def home():
    return render_template('landing/home.html')

@app.route('/about')
def about():
    return render_template('landing/about.html')

@app.route('/services')
def services():
    return render_template('landing/services.html')

@app.route('/gallery')
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
        gallery       = gallery,
        artist_count  = artist_count,
        styles_count  = styles_count
    )

@app.route('/contact')
def contact():
    return render_template('landing/contact.html')

# ════════════════════════════════════════════════════════════
#  LOGIN
# ════════════════════════════════════════════════════════════

@app.route('/login', methods=['GET'])
def login():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login_post():

    role     = request.form.get('role', '').strip()
    password = request.form.get('password', '').strip()

    if not role or not password:
        flash("Please fill all fields!")
        return redirect('/login')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    # ── CUSTOMER ─────────────────────────────────────────────
    if role == 'customer':
        email = request.form.get('email', '').strip()
        if not email:
            conn.close()
            flash("Please enter your email!")
            return redirect('/login')

        cursor.execute("""
            SELECT * FROM customer
            WHERE customer_email = %s AND password = %s
        """, (email, password))
        user = cursor.fetchone()
        conn.close()

        if user:
            session.permanent  = True
            session['user_id'] = user['customer_id']
            session['role']    = 'customer'
            session['name']    = user['customer_name']
            return redirect('/customer/dashboard')
        else:
            flash("Invalid email or password!")
            return redirect('/login')

    # ── ARTIST ───────────────────────────────────────────────
    elif role == 'artist':
        artist_id = request.form.get('artist_id', '').strip()
        if not artist_id:
            conn.close()
            flash("Please enter your Artist ID!")
            return redirect('/login')

        cursor.execute("""
            SELECT * FROM artist
            WHERE artist_id = %s AND password = %s
        """, (artist_id, password))
        user = cursor.fetchone()
        conn.close()

        if user:
            session.permanent  = True
            session['user_id'] = user['artist_id']
            session['role']    = 'artist'
            session['name']    = user['artist_name']
            return redirect('/artist/dashboard')
        else:
            flash("Invalid Artist ID or password!")
            return redirect('/login')

    # ── OWNER ────────────────────────────────────────────────
    elif role == 'owner':
        email = request.form.get('email', '').strip()
        if not email:
            conn.close()
            flash("Please enter your email!")
            return redirect('/login')

        cursor.execute("""
            SELECT * FROM owner
            WHERE email = %s AND password = %s
        """, (email, password))
        user = cursor.fetchone()
        conn.close()

        if user:
            session.permanent  = True
            session['user_id'] = user['owner_id']
            session['role']    = 'owner'
            session['name']    = user['name']
            return redirect('/owner/dashboard')
        else:
            flash("Invalid email or password!")
            return redirect('/login')

    conn.close()
    flash("Please select a valid role!")
    return redirect('/login')

# ════════════════════════════════════════════════════════════
#  REGISTER
# ════════════════════════════════════════════════════════════

@app.route('/register', methods=['GET'])
def register():
    return render_template('register.html')

@app.route('/register', methods=['POST'])
def register_post():
    name     = request.form.get('full_name', '').strip()
    email    = request.form.get('email', '').strip()
    phone    = request.form.get('phone', '').strip()
    password = request.form.get('password', '').strip()
    insta_id = request.form.get('insta_id', '').strip()

    if not name or not email or not phone or not password:
        flash("Please fill all required fields!")
        return redirect('/register')

    if len(password) < 8:
        flash("Password must be at least 8 characters!")
        return redirect('/register')

    conn   = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT customer_id FROM customer
        WHERE customer_email = %s
    """, (email,))
    if cursor.fetchone():
        conn.close()
        flash("Email already registered! Please login.")
        return redirect('/register')

    cursor.execute("""
        INSERT INTO customer
        (customer_name, customer_email, password, phone, insta_id)
        VALUES (%s, %s, %s, %s, %s)
    """, (name, email, password, phone, insta_id))
    conn.commit()
    conn.close()

    flash("Account created successfully! Please login.")
    return redirect('/login')

# ── LOGOUT ───────────────────────────────────────────────────
@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

# ════════════════════════════════════════════════════════════
#  FORGOT PASSWORD — STEP 1 (Enter Email)
# ════════════════════════════════════════════════════════════

@app.route('/forgot-password', methods=['GET'])
def forgot_password():
    return render_template('forgot_password.html')


@app.route('/forgot-password', methods=['POST'])
def forgot_password_post():
    email  = request.form.get('email', '').strip()
    resend = request.form.get('resend', '')

    if not email:
        flash("Please enter your email address!", "error")
        return redirect('/forgot-password')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT customer_id, customer_name
        FROM customer
        WHERE customer_email = %s
    """, (email,))
    customer = cursor.fetchone()
    conn.close()

    if not customer:
        flash("No account found with this email address!", "error")
        return redirect('/forgot-password')

    otp = str(random.randint(100000, 999999))

    session['reset_otp']   = otp
    session['reset_email'] = email
    session['otp_expiry']  = (datetime.now() + timedelta(minutes=10)).strftime('%Y-%m-%d %H:%M:%S')

    try:
        msg      = Message(subject="Dragon Tattoos — Your Password Reset OTP",
                           recipients=[email])
        msg.body = f"Your OTP is: {otp}\nValid for 10 minutes.\nDo not share this with anyone."
        msg.html = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body{{margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;}}
  .wrap{{max-width:520px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);}}
  .hdr{{background:#1a1a2e;padding:32px 40px;text-align:center;}}
  .hdr h1{{color:#fff;font-size:22px;margin:0;letter-spacing:0.15em;}}
  .hdr p{{color:#c8a040;font-size:11px;margin:6px 0 0;letter-spacing:0.2em;}}
  .strip{{height:4px;background:linear-gradient(90deg,#1a1a2e,#c8a040,#1a1a2e);}}
  .body{{padding:36px 40px;}}
  .name{{font-size:16px;color:#1a1a2e;font-weight:600;margin-bottom:8px;}}
  .msg{{font-size:14px;color:#666;line-height:1.7;margin-bottom:28px;}}
  .otp-box{{background:#1a1a2e;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;}}
  .otp-lbl{{font-size:11px;color:#c8a040;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;}}
  .otp-code{{font-size:42px;font-weight:700;color:#fff;letter-spacing:0.3em;}}
  .exp{{font-size:12px;color:rgba(255,255,255,0.4);margin-top:8px;}}
  .warn{{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;font-size:12px;color:#92400e;margin-bottom:24px;}}
  .foot{{background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;}}
  .foot p{{font-size:11px;color:#aaa;margin:0;line-height:1.8;}}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr"><h1>DRAGON TATTOOS</h1><p>Art Etched in Eternity</p></div>
  <div class="strip"></div>
  <div class="body">
    <p class="name">Hello, {customer['customer_name']}!</p>
    <p class="msg">We received a request to reset the password for your Dragon Tattoos account. Use the OTP below to complete your password reset.</p>
    <div class="otp-box">
      <p class="otp-lbl">Your One-Time Password</p>
      <div class="otp-code">{otp}</div>
      <p class="exp">Valid for 10 minutes only</p>
    </div>
    <div class="warn"><strong>Do not share this OTP with anyone.</strong> If you did not request a password reset, please ignore this email.</div>
  </div>
  <div class="foot"><p>Dragon Tattoos Studio | This is an automated email, please do not reply.</p></div>
</div>
</body>
</html>
        """
        mail.send(msg)

        if resend:
            flash("OTP resent successfully! Check your inbox.", "success")
        else:
            flash("OTP sent! Check your email inbox.", "success")

    except Exception as e:
        print("EMAIL ERROR:", e)
        flash("Failed to send OTP. Please try again!", "error")
        return redirect('/forgot-password')

    return render_template('verify_otp.html', email=email)

# ════════════════════════════════════════════════════════════
#  FORGOT PASSWORD — STEP 2 (Verify OTP)
# ════════════════════════════════════════════════════════════

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    entered_otp = request.form.get('otp', '').strip()
    email       = session.get('reset_email', '')
    stored_otp  = session.get('reset_otp', '')
    expiry_str  = session.get('otp_expiry', '')

    if not email or not stored_otp:
        flash("Session expired. Please start again!", "error")
        return redirect('/forgot-password')

    try:
        expiry = datetime.strptime(expiry_str, '%Y-%m-%d %H:%M:%S')
        if datetime.now() > expiry:
            session.pop('reset_otp',   None)
            session.pop('reset_email', None)
            session.pop('otp_expiry',  None)
            flash("OTP has expired! Please request a new one.", "error")
            return redirect('/forgot-password')
    except Exception:
        flash("Session error. Please try again!", "error")
        return redirect('/forgot-password')

    if entered_otp != stored_otp:
        flash("Invalid OTP! Please check and try again.", "error")
        return render_template('verify_otp.html', email=email)

    session['otp_verified'] = True
    session.pop('reset_otp', None)

    return render_template('reset_password.html')

# ════════════════════════════════════════════════════════════
#  FORGOT PASSWORD — STEP 3 (Reset Password)
# ════════════════════════════════════════════════════════════

@app.route('/reset-password', methods=['POST'])
def reset_password():
    if not session.get('otp_verified'):
        flash("Unauthorized! Please verify OTP first.", "error")
        return redirect('/forgot-password')

    email    = session.get('reset_email', '')
    new_pass = request.form.get('new_password', '').strip()
    confirm  = request.form.get('confirm_password', '').strip()

    if not new_pass or not confirm:
        flash("Please fill all fields!", "error")
        return render_template('reset_password.html')

    if new_pass != confirm:
        flash("Passwords do not match!", "error")
        return render_template('reset_password.html')

    if len(new_pass) < 8:
        flash("Password must be at least 8 characters!", "error")
        return render_template('reset_password.html')

    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE customer SET password = %s
        WHERE customer_email = %s
    """, (new_pass, email))
    conn.commit()
    conn.close()

    session.pop('otp_verified', None)
    session.pop('reset_email',  None)
    session.pop('otp_expiry',   None)

    flash("Password reset successful! Please login with your new password.", "success")
    return redirect('/login')

# ════════════════════════════════════════════════════════════
#  CUSTOMER DASHBOARD & ROUTES
# ════════════════════════════════════════════════════════════

@app.route('/customer/dashboard')
def customer_dashboard():
    if session.get('role') != 'customer':
        return redirect('/login')

    customer_id = session['user_id']
    conn        = get_db()
    cursor      = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT a.*, ar.artist_name
        FROM appointment a
        JOIN artist ar ON a.artist_id = ar.artist_id
        WHERE a.customer_id = %s
        ORDER BY a.appointment_date DESC
    """, (customer_id,))
    appointments = cursor.fetchall()

    cursor.execute("""
        SELECT i.*
        FROM invoice i
        JOIN appointment a ON i.appointment_id = a.appointment_id
        WHERE a.customer_id = %s
        ORDER BY i.generated_date DESC
    """, (customer_id,))
    invoices = cursor.fetchall()

    cursor.execute("SELECT * FROM artist")
    artists = cursor.fetchall()

    cursor.execute("SELECT * FROM customer WHERE customer_id = %s", (customer_id,))
    customer_profile = cursor.fetchone()

    cursor.execute("""
        SELECT g.*, a.artist_name
        FROM gallery g
        JOIN artist a ON g.artist_id = a.artist_id
        ORDER BY g.uploaded_at DESC
    """)
    gallery = cursor.fetchall()

    conn.close()

    total_appointments = len(appointments)
    pending_count      = sum(1 for a in appointments if a['status'] == 'Pending')
    done_count         = sum(1 for a in appointments if a['status'] == 'Done')
    total_invoices     = len(invoices)

    return render_template('customer/dashboard.html',
        name               = session['name'],
        appointments       = appointments,
        invoices           = invoices,
        artists            = artists,
        customer_profile   = customer_profile,
        gallery            = gallery,
        total_appointments = total_appointments,
        pending_count      = pending_count,
        done_count         = done_count,
        total_invoices     = total_invoices
    )


# ════════════════════════════════════════════════════════════
#  CUSTOMER BOOK — handles Tattoo / Art / Removal
# ════════════════════════════════════════════════════════════

@app.route('/customer/book', methods=['POST'])
def customer_book():
    if session.get('role') != 'customer':
        return redirect('/login')

    # ── Common fields ─────────────────────────────────────────
    service_type = request.form.get('service_type', '').strip()   # tattoo / art / removal
    artist_id    = request.form.get('artist_id', '').strip()
    appt_date    = request.form.get('appointment_date', '').strip()
    appt_time    = request.form.get('appointment_time', '').strip()

    if not all([service_type, artist_id, appt_date, appt_time]):
        flash("Please fill in all required fields.", "error")
        return redirect('/customer/dashboard')

    # ── Build tattoo_concept + extra_details by service ───────
    extra_details = {}

    if service_type == 'tattoo':
        # ── Tattoo Making ──────────────────────────────────────
        tattoo_concept = request.form.get('tattoo_concept', '').strip()
        if not tattoo_concept:
            flash("Please enter a tattoo concept.", "error")
            return redirect('/customer/dashboard')

        extra_details = {
            'service'           : 'Tattoo Making',
            'size'              : request.form.get('tattoo_size', ''),
            'placement'         : request.form.get('body_placement', ''),
            'style'             : request.form.get('tattoo_style', ''),
            'colour_preference' : request.form.get('colour_preference', ''),
            'notes'             : request.form.get('tattoo_notes', ''),
        }

    elif service_type == 'art':
        # ── Art / Sketching ────────────────────────────────────
        art_type = request.form.get('tattoo_concept', '').strip()   # hidden pill value
        if not art_type:
            flash("Please select an art type.", "error")
            return redirect('/customer/dashboard')

        tattoo_concept = f"Art / Sketching — {art_type}"
        extra_details = {
            'service'           : 'Art / Sketching',
            'art_type'          : art_type,
            'art_size'          : request.form.get('art_size', ''),
            'colour_preference' : request.form.get('art_color_preference', ''),
            'deadline'          : request.form.get('art_deadline', ''),
            'notes'             : request.form.get('art_notes', ''),
        }

    elif service_type == 'removal':
        # ── Tattoo Removal ─────────────────────────────────────
        tattoo_concept = 'Tattoo Removal'
        extra_details = {
            'service'           : 'Tattoo Removal',
            'tattoo_size'       : request.form.get('removal_tattoo_size', ''),
            'tattoo_color'      : request.form.get('removal_tattoo_color', ''),
            'body_location'     : request.form.get('removal_body_location', ''),
            'tattoo_age'        : request.form.get('removal_tattoo_age', ''),
            'sessions_expected' : request.form.get('removal_sessions', ''),
            'skin_sensitivity'  : request.form.get('removal_skin_sensitivity', ''),
            'notes'             : request.form.get('removal_notes', ''),
        }

    else:
        flash("Invalid service type selected.", "error")
        return redirect('/customer/dashboard')

    # ── Reference image upload ─────────────────────────────────
    reference     = None
    uploaded_file = request.files.get('reference_image')

    if uploaded_file and uploaded_file.filename != '':
        if not allowed_file(uploaded_file.filename):
            flash("Only JPG and PNG files are allowed!", "error")
            return redirect('/customer/dashboard')

        uploaded_file.seek(0, 2)
        file_size = uploaded_file.tell()
        uploaded_file.seek(0)
        if file_size > 5 * 1024 * 1024:
            flash("File size must be under 5 MB!", "error")
            return redirect('/customer/dashboard')

        ext      = uploaded_file.filename.rsplit('.', 1)[1].lower()
        filename = secure_filename(
            f"ref_{session['user_id']}_{int(time.time())}.{ext}"
        )
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        uploaded_file.save(save_path)
        reference = f"uploads/references/{filename}"

    # ── Insert into appointment table ──────────────────────────
    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO appointment
                (customer_id, artist_id, tattoo_concept,
                 reference, appointment_date, appointment_time,
                 extra_details)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            session['user_id'],
            artist_id,
            tattoo_concept,
            reference,
            appt_date,
            appt_time,
            json.dumps(extra_details)
        ))
        conn.commit()
        conn.close()
        flash("Booking submitted! Waiting for artist approval.", "success")

    except Exception as e:
        print(f"[Book Error] {e}")
        flash("Something went wrong. Please try again.", "error")

    return redirect('/customer/dashboard')


@app.route('/customer/cancel/<int:appointment_id>', methods=['POST'])
def customer_cancel(appointment_id):
    if session.get('role') != 'customer':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE appointment SET status = 'Cancelled'
        WHERE appointment_id = %s AND customer_id = %s
    """, (appointment_id, session['user_id']))
    conn.commit()
    conn.close()
    flash("Appointment cancelled.")
    return redirect('/customer/dashboard')


@app.route('/customer/change-password', methods=['POST'])
def customer_change_password():
    if session.get('role') != 'customer':
        return redirect('/login')
    current  = request.form.get('current_password')
    new_pass = request.form.get('new_password')
    confirm  = request.form.get('confirm_password')

    if new_pass != confirm:
        flash("Passwords do not match!")
        return redirect('/customer/dashboard')
    if len(new_pass) < 8:
        flash("Password must be at least 8 characters!")
        return redirect('/customer/dashboard')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM customer
        WHERE customer_id = %s AND password = %s
    """, (session['user_id'], current))
    if not cursor.fetchone():
        conn.close()
        flash("Current password is incorrect!")
        return redirect('/customer/dashboard')

    cursor.execute("""
        UPDATE customer SET password = %s WHERE customer_id = %s
    """, (new_pass, session['user_id']))
    conn.commit()
    conn.close()
    flash("Password updated successfully!")
    return redirect('/customer/dashboard')

# ════════════════════════════════════════════════════════════
#  ARTIST DASHBOARD & ROUTES
# ════════════════════════════════════════════════════════════

@app.route('/artist/dashboard')
def artist_dashboard():
    if session.get('role') != 'artist':
        return redirect('/login')

    artist_id = session['user_id']
    conn      = get_db()
    cursor    = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT a.*, c.customer_name
        FROM appointment a
        JOIN customer c ON a.customer_id = c.customer_id
        WHERE a.artist_id = %s
        ORDER BY a.appointment_date DESC
    """, (artist_id,))
    appointments = cursor.fetchall()

    cursor.execute("""
        SELECT a.*, c.customer_name
        FROM appointment a
        JOIN customer c ON a.customer_id = c.customer_id
        WHERE a.artist_id = %s AND a.appointment_date = CURDATE()
        ORDER BY a.appointment_time
    """, (artist_id,))
    today_appointments = cursor.fetchall()

    cursor.execute("SELECT * FROM inventory ORDER BY category, item_name")
    inventory = cursor.fetchall()

    cursor.execute("""
        SELECT u.*, i.item_name
        FROM inventory_usage u
        JOIN inventory i   ON u.item_id        = i.item_id
        JOIN appointment a ON u.appointment_id = a.appointment_id
        WHERE a.artist_id = %s
        ORDER BY u.logged_at DESC
    """, (artist_id,))
    usage_logs = cursor.fetchall()

    cursor.execute("SELECT * FROM artist WHERE artist_id = %s", (artist_id,))
    artist_profile = cursor.fetchone()

    cursor.execute("""
        SELECT * FROM gallery
        WHERE artist_id = %s
        ORDER BY uploaded_at DESC
    """, (artist_id,))
    my_gallery = cursor.fetchall()

    pending_count = sum(1 for a in appointments if a['status'] == 'Pending')
    today_count   = len(today_appointments)
    done_count    = sum(1 for a in appointments if a['status'] == 'Done')
    low_stock     = sum(1 for i in inventory if i['quant_stock'] <= i['reorder_level'])

    conn.close()

    return render_template('artist/dashboard.html',
        name               = session['name'],
        appointments       = appointments,
        today_appointments = today_appointments,
        inventory          = inventory,
        usage_logs         = usage_logs,
        artist_profile     = artist_profile,
        my_gallery         = my_gallery,
        pending_count      = pending_count,
        today_count        = today_count,
        done_count         = done_count,
        low_stock          = low_stock
    )


@app.route('/artist/approve/<int:appointment_id>', methods=['POST'])
def artist_approve(appointment_id):
    if session.get('role') != 'artist':
        return redirect('/login')
    duration = request.form.get('duration_hours')
    conn     = get_db()
    cursor   = conn.cursor()
    cursor.execute("""
        UPDATE appointment
        SET status = 'Approved', duration_hours = %s
        WHERE appointment_id = %s AND artist_id = %s
    """, (duration, appointment_id, session['user_id']))
    conn.commit()
    conn.close()
    flash("Appointment approved!")
    return redirect('/artist/dashboard')


@app.route('/artist/reject/<int:appointment_id>', methods=['POST'])
def artist_reject(appointment_id):
    if session.get('role') != 'artist':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE appointment SET status = 'Rejected'
        WHERE appointment_id = %s AND artist_id = %s
    """, (appointment_id, session['user_id']))
    conn.commit()
    conn.close()
    flash("Appointment rejected.")
    return redirect('/artist/dashboard')


@app.route('/artist/done/<int:appointment_id>', methods=['POST'])
def artist_done(appointment_id):
    if session.get('role') != 'artist':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE appointment SET status = 'Done'
        WHERE appointment_id = %s AND artist_id = %s
    """, (appointment_id, session['user_id']))
    conn.commit()
    conn.close()
    flash("Session marked as done!")
    return redirect('/artist/dashboard')


@app.route('/artist/inventory/add', methods=['POST'])
def artist_inventory_add():
    if session.get('role') != 'artist':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO inventory
        (item_name, category, unit, quant_stock, reorder_level, unit_cost)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        request.form.get('item_name'),
        request.form.get('category'),
        request.form.get('unit'),
        request.form.get('quant_stock'),
        request.form.get('reorder_level'),
        request.form.get('unit_cost')
    ))
    conn.commit()
    conn.close()
    flash("Inventory item added!")
    return redirect('/artist/dashboard')


@app.route('/artist/inventory/update/<int:item_id>', methods=['POST'])
def artist_inventory_update(item_id):
    if session.get('role') != 'artist':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE inventory SET quant_stock = %s WHERE item_id = %s
    """, (request.form.get('quant_stock'), item_id))
    conn.commit()
    conn.close()
    flash("Stock updated!")
    return redirect('/artist/dashboard')


@app.route('/artist/inventory/delete/<int:item_id>', methods=['POST'])
def artist_inventory_delete(item_id):
    if session.get('role') != 'artist':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM inventory WHERE item_id = %s", (item_id,))
    conn.commit()
    conn.close()
    flash("Item deleted!")
    return redirect('/artist/dashboard')


@app.route('/artist/log-usage', methods=['POST'])
def artist_log_usage():
    if session.get('role') != 'artist':
        return redirect('/login')
    appointment_id = request.form.get('appointment_id')
    item_id        = request.form.get('item_id')
    qty_used       = request.form.get('qty_used')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO inventory_usage (appointment_id, item_id, qty_used)
        VALUES (%s, %s, %s)
    """, (appointment_id, item_id, qty_used))
    cursor.execute("""
        UPDATE inventory SET quant_stock = quant_stock - %s
        WHERE item_id = %s
    """, (qty_used, item_id))
    conn.commit()
    conn.close()
    flash("Usage logged and stock updated!")
    return redirect('/artist/dashboard')


@app.route('/artist/change-password', methods=['POST'])
def artist_change_password():
    if session.get('role') != 'artist':
        return redirect('/login')
    current  = request.form.get('current_password')
    new_pass = request.form.get('new_password')
    confirm  = request.form.get('confirm_password')

    if new_pass != confirm:
        flash("New passwords do not match!")
        return redirect('/artist/dashboard')
    if len(new_pass) < 8:
        flash("Password must be at least 8 characters!")
        return redirect('/artist/dashboard')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM artist
        WHERE artist_id = %s AND password = %s
    """, (session['user_id'], current))

    if not cursor.fetchone():
        conn.close()
        flash("Current password is incorrect!")
        return redirect('/artist/dashboard')

    cursor.execute("""
        UPDATE artist SET password = %s WHERE artist_id = %s
    """, (new_pass, session['user_id']))
    conn.commit()
    conn.close()
    flash("Password updated successfully!")
    return redirect('/artist/dashboard')

# ════════════════════════════════════════════════════════════
#  ARTIST GALLERY ROUTES
# ════════════════════════════════════════════════════════════

@app.route('/artist/gallery/upload', methods=['POST'])
def artist_gallery_upload():
    if session.get('role') != 'artist':
        return redirect('/login')

    uploaded_file = request.files.get('gallery_image')
    caption       = request.form.get('caption', '').strip()
    style         = request.form.get('style', '').strip()

    if not uploaded_file or uploaded_file.filename == '':
        flash("Please select an image to upload!", "error")
        return redirect('/artist/dashboard')

    if not allowed_file(uploaded_file.filename):
        flash("Only JPG and PNG files are allowed!", "error")
        return redirect('/artist/dashboard')

    uploaded_file.seek(0, 2)
    file_size = uploaded_file.tell()
    uploaded_file.seek(0)
    if file_size > 5 * 1024 * 1024:
        flash("File size must be under 5 MB!", "error")
        return redirect('/artist/dashboard')

    ext      = uploaded_file.filename.rsplit('.', 1)[1].lower()
    filename = secure_filename(
        f"gallery_{session['user_id']}_{int(time.time())}.{ext}"
    )
    gallery_folder = os.path.join('static', 'uploads', 'gallery')
    os.makedirs(gallery_folder, exist_ok=True)
    uploaded_file.save(os.path.join(gallery_folder, filename))

    image_path = f"uploads/gallery/{filename}"

    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO gallery (artist_id, image_path, caption, style)
        VALUES (%s, %s, %s, %s)
    """, (session['user_id'], image_path, caption, style))
    conn.commit()
    conn.close()

    flash("Image uploaded to gallery successfully! 🎨", "success")
    return redirect('/artist/dashboard')


@app.route('/artist/gallery/delete/<int:gallery_id>', methods=['POST'])
def artist_gallery_delete(gallery_id):
    if session.get('role') != 'artist':
        return redirect('/login')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM gallery
        WHERE gallery_id = %s AND artist_id = %s
    """, (gallery_id, session['user_id']))
    item = cursor.fetchone()

    if item:
        file_path = os.path.join('static', item['image_path'])
        if os.path.exists(file_path):
            os.remove(file_path)
        cursor.execute("DELETE FROM gallery WHERE gallery_id = %s", (gallery_id,))
        conn.commit()
        flash("Image removed from gallery.", "success")
    else:
        flash("Image not found!", "error")

    conn.close()
    return redirect('/artist/dashboard')

# ════════════════════════════════════════════════════════════
#  OWNER DASHBOARD & ROUTES
# ════════════════════════════════════════════════════════════

@app.route('/owner/dashboard')
def owner_dashboard():
    if session.get('role') != 'owner':
        return redirect('/login')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT a.*, c.customer_name, ar.artist_name,
               (SELECT COUNT(*) FROM invoice i
                WHERE i.appointment_id = a.appointment_id) as has_invoice
        FROM appointment a
        JOIN customer c  ON a.customer_id = c.customer_id
        JOIN artist   ar ON a.artist_id   = ar.artist_id
        ORDER BY a.appointment_date DESC
    """)
    appointments = cursor.fetchall()

    cursor.execute("SELECT * FROM artist")
    artists = cursor.fetchall()

    cursor.execute("SELECT * FROM invoice ORDER BY generated_date DESC")
    invoices = cursor.fetchall()

    cursor.execute("SELECT * FROM payment ORDER BY payment_date DESC")
    payments = cursor.fetchall()

    cursor.execute("SELECT * FROM inventory ORDER BY category, item_name")
    inventory = cursor.fetchall()

    cursor.execute("""
        SELECT ar.artist_name, ar.specialisation,
               COUNT(a.appointment_id)   as total_appts,
               SUM(a.status = 'Done')    as done_appts,
               SUM(a.status = 'Pending') as pending_appts
        FROM artist ar
        LEFT JOIN appointment a ON ar.artist_id = a.artist_id
        GROUP BY ar.artist_id
    """)
    artist_performance = cursor.fetchall()

    cursor.execute("""
        SELECT payment_method,
               COUNT(*)         as count,
               SUM(amount_paid) as total
        FROM payment
        GROUP BY payment_method
    """)
    payment_methods = cursor.fetchall()

    cursor.execute("SELECT COUNT(*) as c FROM customer")
    total_customers = cursor.fetchone()['c']

    conn.close()

    total_appointments = len(appointments)
    pending_count      = sum(1 for a in appointments if a['status'] == 'Pending')
    approved_count     = sum(1 for a in appointments if a['status'] == 'Approved')
    done_count         = sum(1 for a in appointments if a['status'] == 'Done')
    rejected_count     = sum(1 for a in appointments if a['status'] == 'Rejected')
    total_artists      = len(artists)
    low_stock          = sum(1 for i in inventory if i['quant_stock'] <= i['reorder_level'])
    low_stock_items    = [i for i in inventory if i['quant_stock'] <= i['reorder_level']]
    unpaid_invoices    = sum(1 for i in invoices  if i['pay_status'] == 'Pending')
    total_invoices     = len(invoices)
    total_revenue      = sum(i['total_amt']   for i in invoices)  if invoices  else 0
    paid_revenue       = sum(p['amount_paid'] for p in payments)  if payments  else 0
    pending_revenue    = total_revenue - paid_revenue

    return render_template('owner/dashboard.html',
        name               = session['name'],
        appointments       = appointments,
        artists            = artists,
        invoices           = invoices,
        payments           = payments,
        inventory          = inventory,
        artist_performance = artist_performance,
        payment_methods    = payment_methods,
        total_appointments = total_appointments,
        pending_count      = pending_count,
        approved_count     = approved_count,
        done_count         = done_count,
        rejected_count     = rejected_count,
        total_artists      = total_artists,
        low_stock          = low_stock,
        low_stock_items    = low_stock_items,
        unpaid_invoices    = unpaid_invoices,
        total_invoices     = total_invoices,
        total_revenue      = total_revenue,
        paid_revenue       = paid_revenue,
        pending_revenue    = pending_revenue,
        total_customers    = total_customers
    )


@app.route('/owner/cancel/<int:appointment_id>', methods=['POST'])
def owner_cancel(appointment_id):
    if session.get('role') != 'owner':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE appointment SET status = 'Cancelled'
        WHERE appointment_id = %s
    """, (appointment_id,))
    conn.commit()
    conn.close()
    flash("Appointment cancelled.")
    return redirect('/owner/dashboard')


@app.route('/owner/artist/add', methods=['POST'])
def owner_artist_add():
    if session.get('role') != 'owner':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO artist
            (artist_id, artist_name, artist_email, password, phone, specialisation)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            request.form.get('artist_id'),
            request.form.get('artist_name'),
            request.form.get('artist_email'),
            request.form.get('password'),
            request.form.get('phone'),
            request.form.get('specialisation')
        ))
        conn.commit()
        flash("Artist added successfully!")
    except Exception as e:
        flash("Error: Artist ID or email already exists!")
    conn.close()
    return redirect('/owner/dashboard')


@app.route('/owner/artist/delete/<artist_id>', methods=['POST'])
def owner_artist_delete(artist_id):
    if session.get('role') != 'owner':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM artist WHERE artist_id = %s", (artist_id,))
    conn.commit()
    conn.close()
    flash("Artist removed.")
    return redirect('/owner/dashboard')


@app.route('/owner/invoice/generate', methods=['POST'])
def owner_invoice_generate():
    if session.get('role') != 'owner':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO invoice
            (appointment_id, owner_id, total_amt, concept_type, pay_status, generated_date)
            VALUES (%s, %s, %s, %s, 'Pending', %s)
        """, (
            request.form.get('appointment_id'),
            session['user_id'],
            request.form.get('total_amt'),
            request.form.get('concept_type'),
            request.form.get('generated_date')
        ))
        conn.commit()
        flash("Invoice generated successfully!")
    except Exception as e:
        flash("Error: Invoice may already exist for this appointment!")
    conn.close()
    return redirect('/owner/dashboard')


@app.route('/owner/payment/record', methods=['POST'])
def owner_payment_record():
    if session.get('role') != 'owner':
        return redirect('/login')
    invoice_id = request.form.get('invoice_id')
    conn       = get_db()
    cursor     = conn.cursor()
    cursor.execute("""
        INSERT INTO payment (invoice_id, amount_paid, payment_method, payment_date)
        VALUES (%s, %s, %s, %s)
    """, (
        invoice_id,
        request.form.get('amount_paid'),
        request.form.get('payment_method'),
        request.form.get('payment_date')
    ))
    cursor.execute("""
        UPDATE invoice SET pay_status = 'Paid' WHERE invoice_id = %s
    """, (invoice_id,))
    conn.commit()
    conn.close()
    flash("Payment recorded successfully!")
    return redirect('/owner/dashboard')

# ════════════════════════════════════════════════════════════
#  INVOICE BILL VIEW — /invoice/view/<invoice_id>
#  Accessible by customer (own invoices) and owner (all)
# ════════════════════════════════════════════════════════════

@app.route('/invoice/view/<int:invoice_id>')
def invoice_view(invoice_id):
    role = session.get('role')
    if role not in ('customer', 'owner'):
        return redirect('/login')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    # Fetch invoice
    cursor.execute("SELECT * FROM invoice WHERE invoice_id = %s", (invoice_id,))
    invoice = cursor.fetchone()

    if not invoice:
        conn.close()
        flash("Invoice not found!", "error")
        return redirect('/customer/dashboard' if role == 'customer' else '/owner/dashboard')

    # If customer — make sure invoice belongs to them
    if role == 'customer':
        cursor.execute("""
            SELECT a.customer_id FROM appointment a
            WHERE a.appointment_id = %s
        """, (invoice['appointment_id'],))
        appt_check = cursor.fetchone()
        if not appt_check or appt_check['customer_id'] != session['user_id']:
            conn.close()
            flash("Access denied!", "error")
            return redirect('/customer/dashboard')

    # Fetch appointment + customer + artist details
    cursor.execute("""
        SELECT a.*, c.customer_name, ar.artist_name
        FROM appointment a
        JOIN customer c  ON a.customer_id = c.customer_id
        JOIN artist   ar ON a.artist_id   = ar.artist_id
        WHERE a.appointment_id = %s
    """, (invoice['appointment_id'],))
    appointment = cursor.fetchone()

    # Fetch payment record if paid
    cursor.execute("SELECT * FROM payment WHERE invoice_id = %s", (invoice_id,))
    payment = cursor.fetchone()

    conn.close()

    # Parse extra_details JSON
    extra = {}
    if appointment and appointment.get('extra_details'):
        try:
            extra = json.loads(appointment['extra_details'])
        except Exception:
            extra = {}

    return render_template('bill.html',
        invoice     = invoice,
        appointment = appointment,
        payment     = payment,
        extra       = extra
    )

if __name__ == '__main__':
    app.run(debug=True)