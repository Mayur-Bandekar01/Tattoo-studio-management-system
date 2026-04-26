import random
import re
from datetime import datetime, timedelta
from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    session,
    flash,
    current_app,
)
from ..db import get_db
from ..utils.email_service import send_otp_email

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["GET"])
def login():
    return render_template("auth/login.html")


def handle_customer_login(cursor, password):
    email = request.form.get("email", "").strip()
    if not email:
        return False, "Please enter your email!"
    cursor.execute(
        "SELECT * FROM customer WHERE customer_email = %s AND password = %s",
        (email, password),
    )
    user = cursor.fetchone()
    if user:
        session.update(
            {
                "user_id": user["customer_id"],
                "role": "customer",
                "name": user["customer_name"],
            }
        )
        return True, "/customer/dashboard"
    return False, "Invalid email or password!"


def handle_artist_login(cursor, password):
    artist_id = request.form.get("artist_id", "").strip()
    if not artist_id:
        return False, "Please enter your Artist ID!"
    cursor.execute(
        "SELECT * FROM artist WHERE artist_id = %s AND password = %s",
        (artist_id, password),
    )
    user = cursor.fetchone()
    if user:
        session.update(
            {
                "user_id": user["artist_id"],
                "role": "artist",
                "name": user["artist_name"],
                "specialisation": user["specialisation"],
            }
        )
        return True, "/artist/dashboard"
    return False, "Invalid Artist ID or password!"


def handle_owner_login(cursor, password):
    email = request.form.get("email", "").strip()
    if not email:
        return False, "Please enter your email!"
    cursor.execute(
        "SELECT * FROM owner WHERE email = %s AND password = %s", (email, password)
    )
    user = cursor.fetchone()
    if user:
        session.update(
            {"user_id": user["owner_id"], "role": "owner", "name": user["name"]}
        )
        return True, "/owner/dashboard"
    return False, "Invalid email or password!"


@auth_bp.route("/login", methods=["POST"])
def login_post():
    role = request.form.get("role", "").strip()
    password = request.form.get("password", "").strip()

    if not role or not password:
        flash("Please fill all fields!")
        return redirect("/login")

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        handlers = {
            "customer": handle_customer_login,
            "artist": handle_artist_login,
            "owner": handle_owner_login,
        }

        handler = handlers.get(role)
        if not handler:
            flash("Please select a valid role!")
            return redirect("/login")

        success, result = handler(cursor, password)

    if success:
        session.permanent = True
        return redirect(result)

    flash(result)
    return redirect("/login")


def is_password_strong(password):
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[^A-Za-z0-9]", password):
        return False
    return True


@auth_bp.route("/register", methods=["GET"])
def register():
    return render_template("auth/register.html")


@auth_bp.route("/register", methods=["POST"])
def register_post():
    name = request.form.get("full_name", "").strip()
    email = request.form.get("email", "").strip()
    phone = request.form.get("phone", "").strip()
    password = request.form.get("password", "").strip()
    insta_id = request.form.get("insta_id", "").strip()

    if not name or not email or not phone or not password:
        flash("Please fill all required fields!")
        return redirect("/register")

    # Email Validation
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        flash("Please enter a valid email address!")
        return redirect("/register")

    # Phone Validation
    if not re.match(r"^\d{10}$", phone):
        flash("Phone number must be exactly 10 digits!")
        return redirect("/register")

    # Password Validation
    if not is_password_strong(password):
        flash("Password does not meet complexity requirements!")
        return redirect("/register")

    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            "SELECT customer_id FROM customer WHERE customer_email = %s", (email,)
        )
        if cursor.fetchone():
            flash("Email already registered! Please login.")
            return redirect("/register")

        cursor.execute(
            """
            INSERT INTO customer (customer_name, customer_email, password, phone, insta_id)
            VALUES (%s, %s, %s, %s, %s)
        """,
            (name, email, password, phone, insta_id),
        )
        conn.commit()
    flash("Account created successfully! Please login.")
    return redirect("/login")


@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect("/")


@auth_bp.route("/forgot-password", methods=["GET"])
def forgot_password():
    return render_template("auth/forgot_password.html")


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password_post():
    email = request.form.get("email", "").strip()
    resend = request.form.get("resend", "")

    if not email:
        flash("Please enter your email address!", "error")
        return redirect("/forgot-password")

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute(
            "SELECT customer_id, customer_name FROM customer WHERE customer_email = %s",
            (email,),
        )
        customer = cursor.fetchone()

    if not customer:
        flash("No account found with this email address!", "error")
        return redirect("/forgot-password")

    otp = str(random.randint(100000, 999999))
    session["reset_otp"] = otp
    session["reset_email"] = email
    session["otp_expiry"] = (datetime.now() + timedelta(minutes=10)).strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    try:
        from ..app import mail

        success = send_otp_email(mail, customer["customer_name"], email, otp)
        if success:
            flash(
                (
                    "OTP resent successfully! Check your inbox."
                    if resend
                    else "OTP sent! Check your email inbox."
                ),
                "success",
            )
        else:
            flash("Failed to send OTP. Please try again!", "error")
            return redirect("/forgot-password")
    except Exception as e:
        current_app.logger.error(f"Error sending OTP: {e}")
        flash("Failed to send OTP. Please try again!", "error")
        return redirect("/forgot-password")

    return render_template("auth/verify_otp.html", email=email)


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    entered_otp = request.form.get("otp", "").strip()
    email = session.get("reset_email", "")
    stored_otp = session.get("reset_otp", "")
    expiry_str = session.get("otp_expiry", "")

    if not email or not stored_otp:
        flash("Session expired. Please start again!", "error")
        return redirect("/forgot-password")

    try:
        expiry = datetime.strptime(expiry_str, "%Y-%m-%d %H:%M:%S")
        if datetime.now() > expiry:
            session.pop("reset_otp", None)
            session.pop("reset_email", None)
            session.pop("otp_expiry", None)
            flash("OTP has expired! Please request a new one.", "error")
            return redirect("/forgot-password")
    except Exception:
        flash("Session error. Please try again!", "error")
        return redirect("/forgot-password")

    if entered_otp != stored_otp:
        flash("Invalid OTP! Please check and try again.", "error")
        return render_template("auth/verify_otp.html", email=email)

    session["otp_verified"] = True
    session.pop("reset_otp", None)
    return render_template("auth/reset_password.html")


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    if not session.get("otp_verified"):
        flash("Unauthorized! Please verify OTP first.", "error")
        return redirect("/forgot-password")

    email = session.get("reset_email", "")
    new_pass = request.form.get("new_password", "").strip()
    confirm = request.form.get("confirm_password", "").strip()

    if not new_pass or not confirm:
        flash("Please fill all fields!", "error")
        return render_template("auth/reset_password.html")
    if new_pass != confirm:
        flash("Passwords do not match!", "error")
        return render_template("auth/reset_password.html")
    if len(new_pass) < 8:
        flash("Password must be at least 8 characters!", "error")
        return render_template("auth/reset_password.html")

    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE customer SET password = %s WHERE customer_email = %s", (new_pass, email)
        )
        conn.commit()

    session.pop("otp_verified", None)
    session.pop("reset_email", None)
    session.pop("otp_expiry", None)

    flash("Password reset successful! Please login.", "success")
    return redirect("/login")
