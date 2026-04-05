# routes/owner.py
import os
import json
from flask import Blueprint, render_template, request, redirect, session, flash, current_app
from db import get_db

owner_bp = Blueprint('owner', __name__)

@owner_bp.route('/owner/dashboard')
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

    cursor.execute("SELECT * FROM artist ORDER BY artist_name")
    artists = cursor.fetchall()

    cursor.execute("SELECT * FROM invoice ORDER BY generated_date DESC")
    invoices = cursor.fetchall()

    cursor.execute("SELECT * FROM payment ORDER BY payment_date DESC")
    payments = cursor.fetchall()

    cursor.execute("""
    SELECT i.*, a.artist_name FROM inventory i
    LEFT JOIN artist a ON i.artist_id = a.artist_id
    ORDER BY a.artist_name, i.category, i.item_name
""")
    inventory = cursor.fetchall()

    cursor.execute("""
        SELECT ar.artist_name, ar.specialisation,
               COUNT(a.appointment_id)      as total_appts,
               SUM(CASE WHEN a.status='Done'      THEN 1 ELSE 0 END) as done_appts,
               SUM(CASE WHEN a.status='Pending'   THEN 1 ELSE 0 END) as pending_appts,
               SUM(CASE WHEN a.status='Approved'  THEN 1 ELSE 0 END) as approved_appts,
               SUM(CASE WHEN a.status='Rejected'  THEN 1 ELSE 0 END) as rejected_count,
               SUM(CASE WHEN a.status='Cancelled' THEN 1 ELSE 0 END) as cancelled_appts,
               (SELECT IFNULL(SUM(p.amount_paid), 0)
                FROM payment p
                JOIN invoice i  ON p.invoice_id       = i.invoice_id
                JOIN appointment a2 ON i.appointment_id = a2.appointment_id
                WHERE a2.artist_id = ar.artist_id
                  AND p.status = 'Approved') as total_revenue
        FROM artist ar
        LEFT JOIN appointment a ON ar.artist_id = a.artist_id
        GROUP BY ar.artist_id, ar.artist_name, ar.specialisation
        ORDER BY total_revenue DESC
    """)
    artist_performance = cursor.fetchall()

    cursor.execute("""
        SELECT
            CASE
                WHEN payment_method LIKE 'UPI%' THEN 'UPI'
                ELSE payment_method
            END AS payment_method,
            COUNT(*)         as count,
            SUM(amount_paid) as total
        FROM payment
        WHERE status = 'Approved'
        GROUP BY
            CASE
                WHEN payment_method LIKE 'UPI%' THEN 'UPI'
                ELSE payment_method
            END
        ORDER BY total DESC
    """)
    payment_methods = cursor.fetchall()

    cursor.execute("""
        SELECT DATE_FORMAT(generated_date,'%Y-%m-%d') as date_key,
               DATE_FORMAT(generated_date,'%b %d')    as date_label,
               SUM(total_amt) as total_revenue
        FROM invoice
        WHERE pay_status='Paid'
          AND generated_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
        GROUP BY date_key, date_label ORDER BY date_key ASC
    """)
    daily_revenue = cursor.fetchall()

    # --- NEW: Style Trends (Tattoo Concepts) ---
    cursor.execute("""
        SELECT concept_type, COUNT(*) as count
        FROM invoice
        WHERE concept_type IS NOT NULL AND concept_type != ''
        GROUP BY concept_type
        ORDER BY count DESC
        LIMIT 5
    """)
    concept_trends = cursor.fetchall()

    # --- NEW: Customer Loyalty (New vs Returning) ---
    cursor.execute("""
        SELECT COUNT(*) as returning_count
        FROM (
            SELECT customer_id FROM appointment
            WHERE status = 'Done'
            GROUP BY customer_id
            HAVING COUNT(*) > 1
        ) as sub
    """)
    returning_customers = cursor.fetchone()['returning_count']

    # --- NEW: Monthly Stats ---
    cursor.execute("""
        SELECT IFNULL(SUM(amount_paid), 0) as monthly_val
        FROM payment
        WHERE status = 'Approved'
          AND MONTH(payment_date) = MONTH(CURDATE())
          AND YEAR(payment_date) = YEAR(CURDATE())
    """)
    monthly_revenue = cursor.fetchone()['monthly_val']

    cursor.execute("SELECT COUNT(*) as c FROM customer")
    total_customers = cursor.fetchone()['c']
    conn.close()

    total_appointments = len(appointments)
    pending_count      = sum(1 for a in appointments if a['status'] == 'Pending')
    approved_count     = sum(1 for a in appointments if a['status'] == 'Approved')
    done_count         = sum(1 for a in appointments if a['status'] == 'Done')
    rejected_count     = sum(1 for a in appointments if a['status'] == 'Rejected')
    cancelled_count    = sum(1 for a in appointments if a['status'] == 'Cancelled')
    total_artists      = len(artists)
    low_stock_items    = [i for i in inventory if i['quant_stock'] <= i['reorder_level']]
    low_stock          = len(low_stock_items)
    unpaid_invoices    = sum(1 for i in invoices if i['pay_status'] == 'Pending')
    total_invoices     = len(invoices)
    total_revenue      = sum(
        p['amount_paid'] for p in payments if p.get('status') == 'Approved'
    ) if payments else 0
    paid_revenue       = total_revenue
    pending_revenue    = sum(
        i['total_amt'] for i in invoices
        if i['pay_status'] in ('Pending', 'Under Review')
    )
    pending_approvals  = sum(
        1 for p in payments if p.get('status') == 'Pending Approval'
    )

    return render_template('owner/dashboard.html',
        name                 = session['name'],
        appointments         = appointments,
        artists              = artists,
        invoices             = invoices,
        payments             = payments,
        inventory            = inventory,
        artist_performance   = artist_performance,
        payment_methods      = payment_methods,
        daily_revenue        = daily_revenue,
        total_appointments   = total_appointments,
        pending_count        = pending_count,
        approved_count       = approved_count,
        done_count           = done_count,
        rejected_count       = rejected_count,
        cancelled_count      = cancelled_count,
        total_artists        = total_artists,
        low_stock            = low_stock,
        low_stock_items      = low_stock_items,
        unpaid_invoices      = unpaid_invoices,
        total_invoices       = total_invoices,
        total_revenue        = total_revenue,
        paid_revenue         = paid_revenue,
        pending_revenue      = pending_revenue,
        total_customers      = total_customers,
        pending_approvals    = pending_approvals,
        concept_trends       = concept_trends,
        returning_customers  = returning_customers,
        monthly_revenue      = monthly_revenue
    )

@owner_bp.route('/owner/cancel/<int:appointment_id>', methods=['POST'])
def owner_cancel(appointment_id):
    if session.get('role') != 'owner':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE appointment SET status = 'Cancelled' WHERE appointment_id = %s",
        (appointment_id,)
    )
    conn.commit()
    conn.close()
    flash("Appointment cancelled successfully.", "success")
    return redirect('/owner/dashboard')

@owner_bp.route('/owner/artist/add', methods=['POST'])
def owner_artist_add():
    if session.get('role') != 'owner':
        return redirect('/login')

    artist_id      = request.form.get('artist_id', '').strip()
    artist_name    = request.form.get('artist_name', '').strip()
    artist_email   = request.form.get('artist_email', '').strip()
    password       = request.form.get('password', '').strip()
    phone          = request.form.get('phone', '').strip()
    specialisation = request.form.get('specialisation', '').strip()

    if not all([artist_id, artist_name, artist_email, password, phone, specialisation]):
        flash("Please fill in all required fields!", "error")
        return redirect('/owner/dashboard')
    if len(password) < 8:
        flash("Artist password must be at least 8 characters!", "error")
        return redirect('/owner/dashboard')

    conn   = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO artist
            (artist_id, artist_name, artist_email, password, phone, specialisation)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (artist_id, artist_name, artist_email, password, phone, specialisation))
        conn.commit()
        flash(f"Artist '{artist_name}' added successfully!", "success")
    except Exception:
        flash("Error: Artist ID or email already exists!", "error")
    finally:
        conn.close()
    return redirect('/owner/dashboard')

@owner_bp.route('/owner/artist/delete/<artist_id>', methods=['POST'])
def owner_artist_delete(artist_id):
    if session.get('role') != 'owner':
        return redirect('/login')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT image_path FROM gallery WHERE artist_id = %s", (artist_id,))
    for img in cursor.fetchall():
        if img['image_path']:
            fp = os.path.join('static', img['image_path'])
            if os.path.exists(fp):
                try: os.remove(fp)
                except Exception: pass

    cursor.execute("SELECT artist_name FROM artist WHERE artist_id = %s", (artist_id,))
    artist      = cursor.fetchone()
    artist_name = artist['artist_name'] if artist else artist_id

    cursor.execute("DELETE FROM gallery WHERE artist_id = %s", (artist_id,))
    cursor.execute("DELETE FROM artist WHERE artist_id = %s", (artist_id,))
    conn.commit()
    conn.close()
    flash(f"Artist '{artist_name}' and all their gallery images have been removed.", "success")
    return redirect('/owner/dashboard')

@owner_bp.route('/owner/invoice/generate', methods=['POST'])
def owner_invoice_generate():
    if session.get('role') != 'owner':
        return redirect('/login')

    appointment_id = request.form.get('appointment_id', '').strip()
    total_amt      = request.form.get('total_amt', '').strip()
    concept_type   = request.form.get('concept_type', '').strip()
    generated_date = request.form.get('generated_date', '').strip()

    if not all([appointment_id, total_amt, concept_type, generated_date]):
        flash("Please fill in all invoice fields!", "error")
        return redirect('/owner/dashboard')

    try:
        total_amt = float(total_amt)
        if total_amt <= 0: raise ValueError
    except ValueError:
        flash("Invalid amount entered!", "error")
        return redirect('/owner/dashboard')

    conn   = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO invoice
            (appointment_id, owner_id, total_amt, concept_type, pay_status, generated_date)
            VALUES (%s, %s, %s, %s, 'Pending', %s)
        """, (appointment_id, session['user_id'], total_amt, concept_type, generated_date))
        conn.commit()
        flash("Invoice generated successfully!", "success")
    except Exception:
        flash("Error: Invoice may already exist for this appointment!", "error")
    finally:
        conn.close()
    return redirect('/owner/dashboard')

@owner_bp.route('/owner/payment/record', methods=['POST'])
def owner_payment_record():
    if session.get('role') != 'owner':
        return redirect('/login')

    invoice_id     = request.form.get('invoice_id', '').strip()
    amount_paid    = request.form.get('amount_paid', '').strip()
    payment_method = request.form.get('payment_method', '').strip()
    payment_date   = request.form.get('payment_date', '').strip()

    if not all([invoice_id, amount_paid, payment_method, payment_date]):
        flash("Please fill in all payment fields!", "error")
        return redirect('/owner/dashboard')

    try:
        amount_paid = float(amount_paid)
        if amount_paid <= 0: raise ValueError
    except ValueError:
        flash("Invalid payment amount!", "error")
        return redirect('/owner/dashboard')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT pay_status FROM invoice WHERE invoice_id = %s", (invoice_id,)
    )
    invoice = cursor.fetchone()

    if not invoice:
        conn.close()
        flash("Invoice not found!", "error")
        return redirect('/owner/dashboard')
    if invoice['pay_status'] == 'Paid':
        conn.close()
        flash("This invoice is already marked as paid!", "error")
        return redirect('/owner/dashboard')

    cursor.execute("""
        INSERT INTO payment
            (invoice_id, amount_paid, payment_method, payment_date, status)
        VALUES (%s, %s, %s, %s, 'Approved')
    """, (invoice_id, amount_paid, payment_method, payment_date))
    cursor.execute(
        "UPDATE invoice SET pay_status = 'Paid' WHERE invoice_id = %s",
        (invoice_id,)
    )
    conn.commit()
    conn.close()
    flash("Payment recorded and invoice marked as Paid!", "success")
    return redirect('/owner/dashboard')

@owner_bp.route('/owner/payment/approve/<int:payment_id>', methods=['POST'])
def owner_payment_approve(payment_id):
    if session.get('role') != 'owner':
        return redirect('/login')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.*, i.invoice_id FROM payment p
        JOIN invoice i ON p.invoice_id = i.invoice_id
        WHERE p.payment_id = %s
    """, (payment_id,))
    payment = cursor.fetchone()

    if not payment:
        conn.close()
        flash("Payment record not found!", "error")
        return redirect('/owner/dashboard')

    cursor.execute(
        "UPDATE payment SET status = 'Approved' WHERE payment_id = %s",
        (payment_id,)
    )
    cursor.execute(
        "UPDATE invoice SET pay_status = 'Paid' WHERE invoice_id = %s",
        (payment['invoice_id'],)
    )
    conn.commit()
    conn.close()
    flash("Payment approved! Invoice is now marked as Paid.", "success")
    return redirect('/owner/dashboard')

@owner_bp.route('/owner/payment/reject/<int:payment_id>', methods=['POST'])
def owner_payment_reject(payment_id):
    if session.get('role') != 'owner':
        return redirect('/login')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.*, i.invoice_id FROM payment p
        JOIN invoice i ON p.invoice_id = i.invoice_id
        WHERE p.payment_id = %s
    """, (payment_id,))
    payment = cursor.fetchone()

    if not payment:
        conn.close()
        flash("Payment record not found!", "error")
        return redirect('/owner/dashboard')

    invoice_id = payment['invoice_id']
    cursor.execute("DELETE FROM payment WHERE payment_id = %s", (payment_id,))
    cursor.execute(
        "UPDATE invoice SET pay_status = 'Pending' WHERE invoice_id = %s",
        (invoice_id,)
    )
    conn.commit()
    conn.close()
    flash("Payment rejected. Invoice has been returned to Pending.", "success")
    return redirect('/owner/dashboard')

@owner_bp.route('/owner/change-password', methods=['POST'])
def owner_change_password():
    if session.get('role') != 'owner':
        return redirect('/login')

    current  = request.form.get('current_password', '').strip()
    new_pass = request.form.get('new_password', '').strip()
    confirm  = request.form.get('confirm_password', '').strip()

    if not all([current, new_pass, confirm]):
        flash("Please fill in all password fields!", "error")
        return redirect('/owner/dashboard')
    if new_pass != confirm:
        flash("New passwords do not match!", "error")
        return redirect('/owner/dashboard')
    if len(new_pass) < 8:
        flash("New password must be at least 8 characters!", "error")
        return redirect('/owner/dashboard')
    if current == new_pass:
        flash("New password must be different from current password!", "error")
        return redirect('/owner/dashboard')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM owner WHERE owner_id = %s AND password = %s",
        (session['user_id'], current)
    )
    if not cursor.fetchone():
        conn.close()
        flash("Current password is incorrect!", "error")
        return redirect('/owner/dashboard')

    cursor.execute(
        "UPDATE owner SET password = %s WHERE owner_id = %s",
        (new_pass, session['user_id'])
    )
    conn.commit()
    conn.close()
    flash("Password updated successfully!", "success")
    return redirect('/owner/dashboard')

@owner_bp.route('/invoice/view/<int:invoice_id>')
def invoice_view(invoice_id):
    role = session.get('role')
    if role not in ('customer', 'owner'):
        return redirect('/login')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM invoice WHERE invoice_id = %s", (invoice_id,))
    invoice = cursor.fetchone()

    if not invoice:
        conn.close()
        flash("Invoice not found!", "error")
        return redirect('/customer/dashboard' if role == 'customer' else '/owner/dashboard')

    if role == 'customer':
        cursor.execute(
            "SELECT a.customer_id FROM appointment a WHERE a.appointment_id = %s",
            (invoice['appointment_id'],)
        )
        appt_check = cursor.fetchone()
        if not appt_check or appt_check['customer_id'] != session['user_id']:
            conn.close()
            flash("Access denied!", "error")
            return redirect('/customer/dashboard')

    cursor.execute("""
        SELECT a.*, c.customer_name, ar.artist_name FROM appointment a
        JOIN customer c  ON a.customer_id = c.customer_id
        JOIN artist   ar ON a.artist_id   = ar.artist_id
        WHERE a.appointment_id = %s
    """, (invoice['appointment_id'],))
    appointment = cursor.fetchone()

    cursor.execute(
        "SELECT * FROM payment WHERE invoice_id = %s ORDER BY payment_date DESC LIMIT 1",
        (invoice_id,)
    )
    payment = cursor.fetchone()
    conn.close()

    extra = {}
    if appointment and appointment.get('extra_details'):
        try:
            extra = json.loads(appointment['extra_details'])
        except Exception:
            extra = {}

    return render_template('billing/bill.html',
        invoice     = invoice,
        appointment = appointment,
        payment     = payment,
        extra       = extra,
        role        = role
    )
