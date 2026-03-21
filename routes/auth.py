# routes/auth.py
import random
from datetime import datetime, timedelta
from flask import Blueprint, render_template, request, redirect, session, flash, current_app
from db import get_db
from utils.email_service import send_otp_email

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET'])
def login():
    return render_template('auth/login.html')

@auth_bp.route('/login', methods=['POST'])
def login_post():
    role     = request.form.get('role', '').strip()
    password = request.form.get('password', '').strip()

    if not role or not password:
        flash("Please fill all fields!")
        return redirect('/login')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    if role == 'customer':
        email = request.form.get('email', '').strip()
        if not email:
            conn.close()
            flash("Please enter your email!")
            return redirect('/login')
        cursor.execute(
            "SELECT * FROM customer WHERE customer_email = %s AND password = %s",
            (email, password)
        )
        user = cursor.fetchone()
        conn.close()
        if user:
            session.permanent  = True
            session['user_id'] = user['customer_id']
            session['role']    = 'customer'
            session['name']    = user['customer_name']
            return redirect('/customer/dashboard')
        flash("Invalid email or password!")
        return redirect('/login')

    elif role == 'artist':
        artist_id = request.form.get('artist_id', '').strip()
        if not artist_id:
            conn.close()
            flash("Please enter your Artist ID!")
            return redirect('/login')
        cursor.execute(
            "SELECT * FROM artist WHERE artist_id = %s AND password = %s",
            (artist_id, password)
        )
        user = cursor.fetchone()
        conn.close()
        if user:
            session.permanent  = True
            session['user_id'] = user['artist_id']
            session['role']    = 'artist'
            session['name']    = user['artist_name']
            return redirect('/artist/dashboard')
        flash("Invalid Artist ID or password!")
        return redirect('/login')

    elif role == 'owner':
        email = request.form.get('email', '').strip()
        if not email:
            conn.close()
            flash("Please enter your email!")
            return redirect('/login')
        cursor.execute(
            "SELECT * FROM owner WHERE email = %s AND password = %s",
            (email, password)
        )
        user = cursor.fetchone()
        conn.close()
        if user:
            session.permanent  = True
            session['user_id'] = user['owner_id']
            session['role']    = 'owner'
            session['name']    = user['name']
            return redirect('/owner/dashboard')
        flash("Invalid email or password!")
        return redirect('/login')

    conn.close()
    flash("Please select a valid role!")
    return redirect('/login')

@auth_bp.route('/register', methods=['GET'])
def register():
    return render_template('auth/register.html')

@auth_bp.route('/register', methods=['POST'])
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
    cursor.execute(
        "SELECT customer_id FROM customer WHERE customer_email = %s", (email,)
    )
    if cursor.fetchone():
        conn.close()
        flash("Email already registered! Please login.")
        return redirect('/register')

    cursor.execute("""
        INSERT INTO customer (customer_name, customer_email, password, phone, insta_id)
        VALUES (%s, %s, %s, %s, %s)
    """, (name, email, password, phone, insta_id))
    conn.commit()
    conn.close()
    flash("Account created successfully! Please login.")
    return redirect('/login')

@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@auth_bp.route('/forgot-password', methods=['GET'])
def forgot_password():
    return render_template('auth/forgot_password.html')

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password_post():
    email  = request.form.get('email', '').strip()
    resend = request.form.get('resend', '')

    if not email:
        flash("Please enter your email address!", "error")
        return redirect('/forgot-password')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT customer_id, customer_name FROM customer WHERE customer_email = %s",
        (email,)
    )
    customer = cursor.fetchone()
    conn.close()

    if not customer:
        flash("No account found with this email address!", "error")
        return redirect('/forgot-password')

    otp = str(random.randint(100000, 999999))
    session['reset_otp']   = otp
    session['reset_email'] = email
    session['otp_expiry']  = (
        datetime.now() + timedelta(minutes=10)
    ).strftime('%Y-%m-%d %H:%M:%S')

    # Send email via helper
    from app import app, mail  # Lazy export to avoid circular imports during setup if needed, but current_app and actual mail obj works better.  
    # Wait, simple fix: I'll use the imported mail extension directly if accessible, but passing `mail` object works.
    # Let's import it safely.
    try:
        from app import mail
        success = send_otp_email(mail, customer['customer_name'], email, otp)
        if success:
            flash(
                "OTP resent successfully! Check your inbox." if resend
                else "OTP sent! Check your email inbox.",
                "success"
            )
        else:
            flash("Failed to send OTP. Please try again!", "error")
            return redirect('/forgot-password')
    except Exception as e:
        current_app.logger.error(f"Error sending OTP: {e}")
        flash("Failed to send OTP. Please try again!", "error")
        return redirect('/forgot-password')

    return render_template('auth/verify_otp.html', email=email)

@auth_bp.route('/verify-otp', methods=['POST'])
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
            session.pop('reset_otp', None)
            session.pop('reset_email', None)
            session.pop('otp_expiry', None)
            flash("OTP has expired! Please request a new one.", "error")
            return redirect('/forgot-password')
    except Exception:
        flash("Session error. Please try again!", "error")
        return redirect('/forgot-password')

    if entered_otp != stored_otp:
        flash("Invalid OTP! Please check and try again.", "error")
        return render_template('auth/verify_otp.html', email=email)

    session['otp_verified'] = True
    session.pop('reset_otp', None)
    return render_template('auth/reset_password.html')

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    if not session.get('otp_verified'):
        flash("Unauthorized! Please verify OTP first.", "error")
        return redirect('/forgot-password')

    email    = session.get('reset_email', '')
    new_pass = request.form.get('new_password', '').strip()
    confirm  = request.form.get('confirm_password', '').strip()

    if not new_pass or not confirm:
        flash("Please fill all fields!", "error")
        return render_template('auth/reset_password.html')
    if new_pass != confirm:
        flash("Passwords do not match!", "error")
        return render_template('auth/reset_password.html')
    if len(new_pass) < 8:
        flash("Password must be at least 8 characters!", "error")
        return render_template('auth/reset_password.html')

    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE customer SET password = %s WHERE customer_email = %s",
        (new_pass, email)
    )
    conn.commit()
    conn.close()

    session.pop('otp_verified', None)
    session.pop('reset_email',  None)
    session.pop('otp_expiry',   None)

    flash("Password reset successful! Please login.", "success")
    return redirect('/login')
