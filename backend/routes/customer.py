import os
import time
import json
from datetime import date
from werkzeug.utils import secure_filename
from flask import Blueprint, render_template, request, redirect, session, flash, current_app, jsonify
from db import get_db

from utils.decorators import role_required
from utils.validators import allowed_file, validate_image_size

customer_bp = Blueprint('customer', __name__)

import secrets

# ── CUSTOMER DASHBOARD ROUTE ──────────────────────────────────
@customer_bp.route('/customer/dashboard')
@role_required('customer')
def customer_dashboard():
    """Main panel where customers view their bookings, invoices, and the gallery."""

    # Generate CSRF token for the session if it doesn't exist
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(16)

    customer_id = session['user_id']
    conn        = get_db()
    cursor      = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT a.*, ar.artist_name FROM appointment a
        JOIN artist ar ON a.artist_id = ar.artist_id
        WHERE a.customer_id = %s ORDER BY a.appointment_date DESC
    """, (customer_id,))
    appointments = cursor.fetchall()

    cursor.execute("""
        SELECT i.* FROM invoice i
        JOIN appointment a ON i.appointment_id = a.appointment_id
        WHERE a.customer_id = %s ORDER BY i.generated_date DESC
    """, (customer_id,))
    invoices = cursor.fetchall()

    cursor.execute("SELECT * FROM artist")
    artists = cursor.fetchall()

    cursor.execute(
        "SELECT * FROM customer WHERE customer_id = %s", (customer_id,)
    )
    customer_profile = cursor.fetchone()

    cursor.execute("""
        SELECT g.*, a.artist_name FROM gallery g
        JOIN artist a ON g.artist_id = a.artist_id
        ORDER BY g.uploaded_at DESC
    """)
    gallery = cursor.fetchall()

    cursor.execute(
        "SELECT gallery_id FROM gallery_likes WHERE customer_id = %s",
        (customer_id,)
    )
    liked_rows  = cursor.fetchall()
    liked_ids   = set(row['gallery_id'] for row in liked_rows)
    liked_count = len(liked_ids)
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
        liked_ids          = liked_ids,
        liked_count        = liked_count,
        total_appointments = total_appointments,
        pending_count      = pending_count,
        done_count         = done_count,
        total_invoices     = total_invoices,
        csrf_token         = session.get('csrf_token')
    )

# ── BOOKING SYSTEM (Submit a new appointment) ────────────────
@customer_bp.route('/customer/book', methods=['POST'])
@role_required('customer')
def customer_book():
    """Handles the sophisticated booking form, including image uploads and logic based on service type."""

    # Verify CSRF Token
    form_csrf = request.form.get('csrf_token')
    if not form_csrf or form_csrf != session.get('csrf_token'):
        flash("Invalid security token. Please try again.", "error")
        return redirect('/customer/dashboard')

    service_type = request.form.get('service_type', '').strip()
    artist_id    = request.form.get('artist_id', '').strip()
    appt_date    = request.form.get('appointment_date', '').strip()
    appt_time    = request.form.get('appointment_time', '').strip()

    if not all([service_type, artist_id, appt_date, appt_time]):
        flash("Please fill in all required fields.", "error")
        return redirect('/customer/dashboard')

    if appt_date < date.today().isoformat():
        flash("Cannot book appointments in the past.", "error")
        return redirect('/customer/dashboard')

    extra_details  = {}
    tattoo_concept = ''

    if service_type == 'tattoo':
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
        art_type = request.form.get('art_type_selected', '').strip()
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

    # ── FIX: Reference image ──────────────────────────────────────────────────
    # The booking form has THREE file inputs all named 'reference_image'
    # (one each for tattoo, art, removal blocks).
    # request.files.get() always returns the FIRST match — which is the
    # empty tattoo input when the customer is booking art or removal.
    # getlist() returns ALL of them; we pick the first one that has a file.
    uploaded_files = request.files.getlist('reference_image')
    uploaded_file  = next(
        (f for f in uploaded_files if f and f.filename.strip()), None
    )
    # ─────────────────────────────────────────────────────────────────────────

    reference = None
    if uploaded_file:
        if not allowed_file(uploaded_file.filename):
            flash("Only JPG and PNG files are allowed!", "error")
            return redirect('/customer/dashboard')
        if not validate_image_size(uploaded_file, max_size_mb=5):
            flash("File size must be under 5 MB!", "error")
            return redirect('/customer/dashboard')
        # Safe extension extraction
        filename_parts = uploaded_file.filename.rsplit('.', 1)
        if len(filename_parts) < 2:
            flash("Invalid file extension!", "error")
            return redirect('/customer/dashboard')

        ext      = filename_parts[1].lower()
        filename = secure_filename(
            f"ref_{session['user_id']}_{int(time.time())}.{ext}"
        )
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        uploaded_file.save(save_path)
        reference = f"uploads/references/{filename}"

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT appointment_id FROM appointment
        WHERE artist_id = %s AND appointment_date = %s
          AND appointment_time = %s
          AND status NOT IN ('Cancelled', 'Rejected')
    """, (artist_id, appt_date, appt_time))
    if cursor.fetchone():
        conn.close()
        if reference:
            try: os.remove(os.path.join(current_app.static_folder, reference))
            except: pass
        flash("That time slot is already booked. Please choose a different time.", "error")
        return redirect('/customer/dashboard')

    cursor.execute("""
        SELECT appointment_id FROM appointment
        WHERE customer_id = %s AND artist_id = %s
          AND appointment_date = %s AND appointment_time = %s
          AND status NOT IN ('Cancelled', 'Rejected')
    """, (session['user_id'], artist_id, appt_date, appt_time))
    if cursor.fetchone():
        conn.close()
        if reference:
            try: os.remove(os.path.join(current_app.static_folder, reference))
            except: pass
        flash("You already have a booking with this artist at that time.", "error")
        return redirect('/customer/dashboard')

    try:
        cursor.execute("""
            INSERT INTO appointment
                (customer_id, artist_id, tattoo_concept, reference,
                 appointment_date, appointment_time, extra_details)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            session['user_id'], artist_id, tattoo_concept, reference,
            appt_date, appt_time, json.dumps(extra_details)
        ))
        conn.commit()
        flash("Booking submitted! Waiting for artist approval.", "success")
    except Exception as e:
        current_app.logger.error(f"Booking Error: {e}")
        flash("Something went wrong. Please try again.", "error")
    finally:
        conn.close()

    return redirect('/customer/dashboard')

# ── APPOINTMENT ACTIONS (Cancel or Delete) ────────────────────
@customer_bp.route('/customer/cancel/<int:appointment_id>', methods=['POST'])
@role_required('customer')
def customer_cancel(appointment_id):
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE appointment SET status = 'Cancelled'
        WHERE appointment_id = %s AND customer_id = %s
    """, (appointment_id, session['user_id']))
    conn.commit()
    conn.close()
    flash("Appointment cancelled.", "success")
    return redirect('/customer/dashboard')

@customer_bp.route('/customer/delete/<int:appointment_id>', methods=['POST'])
@role_required('customer')
def customer_delete(appointment_id):

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM appointment
        WHERE appointment_id = %s AND customer_id = %s
    """, (appointment_id, session['user_id']))
    appt = cursor.fetchone()

    if not appt:
        conn.close()
        flash("Appointment not found!", "error")
        return redirect('/customer/dashboard')

    if appt['status'] not in ('Cancelled', 'Rejected'):
        conn.close()
        flash("Only cancelled or rejected appointments can be deleted.", "error")
        return redirect('/customer/dashboard')

    if appt.get('reference'):
        file_path = os.path.join(current_app.static_folder, appt['reference'])
        if os.path.exists(file_path):
            try: os.remove(file_path)
            except Exception: pass

    cursor.execute(
        "DELETE FROM appointment WHERE appointment_id = %s", (appointment_id,)
    )
    conn.commit()
    conn.close()
    flash("Appointment deleted successfully.", "success")
    return redirect('/customer/dashboard')

# ── BILLING & PAYMENTS (Submit payment info for review) ──────
@customer_bp.route('/customer/pay/<int:invoice_id>', methods=['POST'])
@role_required('customer')
def customer_pay(invoice_id):

    payment_method  = request.form.get('payment_method', '').strip()
    transaction_ref = request.form.get('transaction_ref', '').strip()
    upi_app         = request.form.get('upi_app', '').strip()

    if payment_method not in ('UPI', 'Card', 'Cash'):
        flash("Invalid payment method selected.", "error")
        return redirect('/customer/dashboard')

    if payment_method == 'UPI':
        if not transaction_ref or not transaction_ref.isdigit() or len(transaction_ref) != 12:
            flash(
                "Invalid UTR number. Please enter the 12-digit reference "
                "from your UPI app.",
                "error"
            )
            return redirect(f'/invoice/view/{invoice_id}')

    if payment_method == 'UPI':
        app_names = {
            'gpay'   : 'GPay',
            'phonepe': 'PhonePe',
            'paytm'  : 'Paytm',
            'bhim'   : 'BHIM'
        }
        app_label     = app_names.get(upi_app, '')
        via_str       = f" via {app_label}" if app_label else ''
        stored_method = f"UPI{via_str} — UTR: {transaction_ref}"
    elif payment_method == 'Card':
        stored_method = "Card"
    else:
        stored_method = "Cash"

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT i.*, a.customer_id FROM invoice i
        JOIN appointment a ON i.appointment_id = a.appointment_id
        WHERE i.invoice_id = %s
    """, (invoice_id,))
    invoice = cursor.fetchone()

    if not invoice or invoice['customer_id'] != session['user_id']:
        conn.close()
        flash("Invoice not found!", "error")
        return redirect('/customer/dashboard')

    if invoice['pay_status'] == 'Paid':
        conn.close()
        flash("This invoice is already paid!", "error")
        return redirect('/customer/dashboard')

    if invoice['pay_status'] == 'Under Review':
        conn.close()
        flash(
            "Your payment is already under review. "
            "Please wait for owner confirmation.",
            "error"
        )
        return redirect('/customer/dashboard')

    cursor.execute("""
        INSERT INTO payment
            (invoice_id, amount_paid, payment_method, payment_date, status)
        VALUES (%s, %s, %s, CURDATE(), 'Pending Approval')
    """, (invoice_id, invoice['total_amt'], stored_method))

    cursor.execute("""
        UPDATE invoice SET pay_status = 'Under Review'
        WHERE invoice_id = %s
    """, (invoice_id,))

    conn.commit()
    conn.close()

    flash(
        "Payment submitted successfully! "
        "The owner will verify and confirm within 24 hours.",
        "success"
    )
    return redirect('/customer/dashboard')

# ── CUSTOMER ACCOUNT & GALLERY LIKES ─────────────────────────
@customer_bp.route('/customer/change-password', methods=['POST'])
@role_required('customer')
def customer_change_password():

    current  = request.form.get('current_password', '').strip()
    new_pass = request.form.get('new_password', '').strip()
    confirm  = request.form.get('confirm_password', '').strip()

    if new_pass != confirm:
        flash("Passwords do not match!", "error")
        return redirect('/customer/dashboard')
    if len(new_pass) < 8:
        flash("Password must be at least 8 characters!", "error")
        return redirect('/customer/dashboard')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM customer WHERE customer_id = %s AND password = %s",
        (session['user_id'], current)
    )
    if not cursor.fetchone():
        conn.close()
        flash("Current password is incorrect!", "error")
        return redirect('/customer/dashboard')

    cursor.execute(
        "UPDATE customer SET password = %s WHERE customer_id = %s",
        (new_pass, session['user_id'])
    )
    conn.commit()
    conn.close()
    flash("Password updated successfully!", "success")
    return redirect('/customer/dashboard')

@customer_bp.route('/customer/gallery/like/<int:gallery_id>', methods=['POST'])
@role_required('customer')
def customer_gallery_like(gallery_id):

    customer_id = session['user_id']
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT like_id FROM gallery_likes WHERE gallery_id = %s AND customer_id = %s",
        (gallery_id, customer_id)
    )
    existing = cursor.fetchone()

    if existing:
        cursor.execute(
            "DELETE FROM gallery_likes WHERE gallery_id = %s AND customer_id = %s",
            (gallery_id, customer_id)
        )
        conn.commit()
        cursor.execute(
            "SELECT COUNT(*) as cnt FROM gallery_likes WHERE gallery_id = %s",
            (gallery_id,)
        )
        count = cursor.fetchone()['cnt']
        conn.close()
        return jsonify({'success': True, 'liked': False, 'count': count})
    else:
        cursor.execute(
            "INSERT INTO gallery_likes (gallery_id, customer_id) VALUES (%s, %s)",
            (gallery_id, customer_id)
        )
        conn.commit()
        cursor.execute(
            "SELECT COUNT(*) as cnt FROM gallery_likes WHERE gallery_id = %s",
            (gallery_id,)
        )
        count = cursor.fetchone()['cnt']
        conn.close()
        return jsonify({'success': True, 'liked': True, 'count': count})

@customer_bp.route('/customer/gallery/liked')
@role_required('customer')
def customer_gallery_liked():

    customer_id = session['user_id']
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT g.*, a.artist_name, gl.liked_at FROM gallery_likes gl
        JOIN gallery g ON gl.gallery_id = g.gallery_id
        JOIN artist  a ON g.artist_id   = a.artist_id
        WHERE gl.customer_id = %s ORDER BY gl.liked_at DESC
    """, (customer_id,))
    liked_items = cursor.fetchall()
    conn.close()

    result = []
    for item in liked_items:
        result.append({
            'gallery_id' : item['gallery_id'],
            'image_path' : item['image_path'],
            'caption'    : item['caption'] or 'Untitled',
            'style'      : item['style'] or '',
            'artist_name': item['artist_name'],
        })
    return jsonify({'success': True, 'items': result})