import os
import json
from flask import Blueprint, render_template, request, redirect, session, flash, current_app
from datetime import date, datetime, timedelta
from ..db import get_db
from ..utils.decorators import role_required
from ..utils.validators import is_valid_numeric

owner_bp = Blueprint('owner', __name__)

def sanitize_for_json(data):
    """Recursively convert timedelta, date, and datetime objects to strings for JSON serialization."""
    if isinstance(data, list):
        return [sanitize_for_json(item) for item in data]
    if isinstance(data, dict):
        return {k: sanitize_for_json(v) for k, v in data.items()}
    if isinstance(data, timedelta):
        # Convert timedelta to "HH:MM:SS" string
        total_seconds = int(data.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    if isinstance(data, (date, datetime)):
        return data.isoformat()
    return data

# ── DASHBOARD STATISTICS HELPERS ──────────────────────────────

def get_dashboard_stats(cursor):
    """Fetch aggregated statistics for the owner dashboard."""
    cursor.execute("SELECT COUNT(*) as c FROM customer")
    total_customers = cursor.fetchone()['c']
    
    cursor.execute("""
        SELECT COUNT(*) as returning_count
        FROM (SELECT customer_id FROM appointment WHERE status = 'Done' GROUP BY customer_id HAVING COUNT(*) > 1) as sub
    """)
    returning_customers = cursor.fetchone()['returning_count']
    
    cursor.execute("""
        SELECT IFNULL(SUM(amount_paid), 0) as monthly_val
        FROM payment
        WHERE status = 'Approved' 
          AND MONTH(payment_date) = MONTH(CURDATE())
          AND YEAR(payment_date) = YEAR(CURDATE())
    """)
    monthly_revenue = cursor.fetchone()['monthly_val']
    
    return {
        'total_customers': total_customers,
        'returning_customers': returning_customers,
        'monthly_revenue': monthly_revenue
    }

# ── PERFORMANCE & ANALYTICS HELPERS ──────────────────────────

def get_performance_data(cursor):
    """Fetch performance and trend data."""
    cursor.execute("""
        SELECT ar.artist_id, ar.artist_name, ar.specialisation,
               (SELECT COUNT(*) FROM appointment a WHERE a.artist_id = ar.artist_id) as total_appts,
               (SELECT COUNT(*) FROM appointment a WHERE a.artist_id = ar.artist_id AND a.status = 'Done') as done_appts,
               (SELECT COUNT(*) FROM appointment a WHERE a.artist_id = ar.artist_id AND a.status = 'Approved') as approved_appts,
               (SELECT COUNT(*) FROM appointment a WHERE a.artist_id = ar.artist_id AND a.status = 'Pending') as pending_appts,
               (SELECT COUNT(*) FROM appointment a WHERE a.artist_id = ar.artist_id AND a.status = 'Rejected') as rejected_count,
               (SELECT COUNT(*) FROM appointment a WHERE a.artist_id = ar.artist_id AND a.status = 'Cancelled') as cancelled_appts,
               (SELECT IFNULL(SUM(p.amount_paid), 0)
                FROM payment p JOIN invoice i ON p.invoice_id = i.invoice_id
                JOIN appointment a2 ON i.appointment_id = a2.appointment_id
                WHERE a2.artist_id = ar.artist_id AND p.status = 'Approved') as total_revenue
        FROM artist ar ORDER BY total_revenue DESC
    """)
    artist_performance = cursor.fetchall()

    cursor.execute("""
        SELECT CASE WHEN payment_method LIKE 'UPI%' THEN 'UPI' ELSE payment_method END AS payment_method,
               COUNT(*) as count, IFNULL(SUM(amount_paid), 0) as total
        FROM payment WHERE status = 'Approved'
        GROUP BY payment_method ORDER BY total DESC
    """)
    payment_methods = cursor.fetchall()

    cursor.execute("""
        SELECT DATE_FORMAT(generated_date,'%Y-%m-%d') as date_key,
               DATE_FORMAT(generated_date,'%b %d') as date_label,
               SUM(total_amt) as total_revenue
        FROM invoice WHERE pay_status='Paid'
          AND generated_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
        GROUP BY date_key, date_label ORDER BY date_key ASC
    """)
    daily_revenue = cursor.fetchall()

    cursor.execute("""
        SELECT concept_type, COUNT(*) as count
        FROM invoice WHERE concept_type IS NOT NULL AND concept_type != ''
        GROUP BY concept_type ORDER BY count DESC LIMIT 5
    """)
    concept_trends = cursor.fetchall()

    return {
        'artist_performance': artist_performance,
        'payment_methods':    payment_methods,
        'daily_revenue':      daily_revenue,
        'concept_trends':     concept_trends
    }

# ── MAIN OWNER DASHBOARD ROUTE ───────────────────────────────
@owner_bp.route('/owner/dashboard')
@role_required('owner')
def owner_dashboard():
    """Aggregates all studio data into one main control panel for the owner."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Core Data
    cursor.execute("""
        SELECT a.*, c.customer_name, ar.artist_name,
               (SELECT COUNT(*) FROM invoice i WHERE i.appointment_id = a.appointment_id) as has_invoice
        FROM appointment a
        JOIN customer c ON a.customer_id = c.customer_id
        JOIN artist ar ON a.artist_id = ar.artist_id
        ORDER BY a.appointment_date DESC
    """)
    appointments = cursor.fetchall()
    
    cursor.execute("SELECT * FROM artist")
    artists = cursor.fetchall()
    
    cursor.execute("""
        SELECT i.*, i.concept_type, a.customer_id, c.customer_name, a.artist_id FROM invoice i 
        JOIN appointment a ON i.appointment_id = a.appointment_id 
        JOIN customer c ON a.customer_id = c.customer_id 
        ORDER BY i.generated_date DESC
    """)
    invoices = cursor.fetchall()
    
    cursor.execute("""
        SELECT p.*, i.appointment_id, c.customer_name FROM payment p 
        JOIN invoice i ON p.invoice_id = i.invoice_id 
        JOIN appointment a ON i.appointment_id = a.appointment_id 
        JOIN customer c ON a.customer_id = c.customer_id 
        ORDER BY p.payment_date DESC
    """)
    payments = cursor.fetchall()
    
    cursor.execute("""
        SELECT inv.*, a.artist_name
        FROM inventory inv
        LEFT JOIN artist a ON inv.artist_id = a.artist_id
        ORDER BY a.artist_name, inv.category, inv.item_name
    """)
    inventory = cursor.fetchall()
    # Provide formatted date string for template
    for item in inventory:
        lu = item.get('last_updated')
        item['last_updated_str'] = lu.strftime('%Y-%m-%d') if lu else ''

    # Aggregates & Performance
    stats = get_dashboard_stats(cursor)
    perf  = get_performance_data(cursor)

    # Derived Python Stats
    low_stock_items = [i for i in inventory if (i.get('quant_stock') or 0) <= (i.get('reorder_level') or 0)]
    total_revenue   = sum((p.get('amount_paid') or 0) for p in payments if p.get('status') == 'Approved')
    
    return render_template('owner/dashboard.html',
        name                 = session['name'],
        appointments         = sanitize_for_json(appointments),
        artists              = sanitize_for_json(artists),
        invoices             = sanitize_for_json(invoices),
        payments             = sanitize_for_json(payments),
        inventory            = sanitize_for_json(inventory),
        artist_performance   = sanitize_for_json(perf['artist_performance']),
        payment_methods      = sanitize_for_json(perf['payment_methods']),
        daily_revenue        = sanitize_for_json(perf['daily_revenue']),
        concept_trends       = sanitize_for_json(perf['concept_trends']),
        total_appointments   = len(appointments),
        pending_count        = sum(1 for a in appointments if a['status'] == 'Pending'),
        approved_count       = sum(1 for a in appointments if a['status'] == 'Approved'),
        done_count           = sum(1 for a in appointments if a['status'] == 'Done'),
        rejected_count       = sum(1 for a in appointments if a['status'] == 'Rejected'),
        cancelled_count      = sum(1 for a in appointments if a['status'] == 'Cancelled'),
        total_artists        = len(artists),
        low_stock            = len(low_stock_items),
        low_stock_items      = sanitize_for_json(low_stock_items),
        unpaid_invoices      = sum(1 for i in invoices if i['pay_status'] == 'Pending'),
        total_invoices       = len(invoices),
        total_revenue        = total_revenue,
        paid_revenue         = total_revenue,
        total_customers      = stats['total_customers'],
        pending_approvals    = sum(1 for p in payments if p.get('status') == 'Pending Approval'),
        returning_customers  = stats['returning_customers'],
        monthly_revenue      = stats['monthly_revenue'],
        pending_revenue      = sum((i.get('total_amt') or 0) for i in invoices if i['pay_status'] in ('Pending', 'Under Review'))
    )

# ── APPOINTMENT ACTIONS ──────────────────────────────────────
@owner_bp.route('/owner/cancel/<int:appointment_id>', methods=['POST'])
@role_required('owner')
def owner_cancel(appointment_id):
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE appointment SET status = 'Cancelled' WHERE appointment_id = %s",
        (appointment_id,)
    )
    conn.commit()
    flash("Appointment cancelled successfully.", "success")
    return redirect('/owner/dashboard')

# ── ARTIST MANAGEMENT (Add/Delete/List) ──────────────────────
@owner_bp.route('/owner/artist/add', methods=['POST'])
@role_required('owner')
def owner_artist_add():

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
        pass
    return redirect('/owner/dashboard')

@owner_bp.route('/owner/artist/delete/<artist_id>', methods=['POST'])
@role_required('owner')
def owner_artist_delete(artist_id):

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT image_path FROM gallery WHERE artist_id = %s", (artist_id,))
    for img in cursor.fetchall():
        if img['image_path']:
            fp = os.path.join(current_app.static_folder, img['image_path'])
            if os.path.exists(fp):
                try: os.remove(fp)
                except Exception: pass

    cursor.execute("SELECT artist_name FROM artist WHERE artist_id = %s", (artist_id,))
    artist      = cursor.fetchone()
    artist_name = artist['artist_name'] if artist else artist_id

    try:
        # 1. Clean up gallery images from database
        cursor.execute("DELETE FROM gallery WHERE artist_id = %s", (artist_id,))

        # 1.5 Clean up orphaned messages
        cursor.execute("DELETE FROM messages WHERE sender_id = %s OR receiver_id = %s", (artist_id, artist_id))
        
        # 2. Delete the artist (SQL Foreign Key CASCADE will handle appointments)
        cursor.execute("DELETE FROM artist WHERE artist_id = %s", (artist_id,))
        
        conn.commit()
        flash(f"Artist '{artist_name}' and all their gallery images have been removed.", "success")
    except Exception as e:
        conn.rollback()
        # If the user hasn't run the SQL script yet, catch the foreign key error specifically
        if "1451" in str(e):
            flash(f"Cannot delete artist '{artist_name}' because they have active appointments or dependencies. Have you applied the SQL migration script in MySQL Workbench?", "error")
        else:
            flash(f"An error occurred: {str(e)}", "error")
    finally:
        pass
    
    return redirect('/owner/dashboard')

# ── OWNER INVENTORY MANAGEMENT ───────────────────────────────
@owner_bp.route('/owner/inventory/add', methods=['POST'])
@role_required('owner')
def owner_inventory_add():
    """Owner adds a supply item to a specific artist's inventory."""
    item_name     = request.form.get('item_name', '').strip()
    category      = request.form.get('category', '').strip()
    unit          = request.form.get('unit', '').strip()
    quant_stock   = request.form.get('quant_stock', '').strip()
    reorder_level = request.form.get('reorder_level', '').strip()
    unit_cost     = request.form.get('unit_cost', '').strip()
    artist_id     = request.form.get('artist_id', '').strip() or None

    if not all([item_name, category, unit, quant_stock, reorder_level, unit_cost]):
        flash("Please fill in all required inventory fields!", "error")
        return redirect('/owner/dashboard')

    if not is_valid_numeric(quant_stock) or not is_valid_numeric(reorder_level) or not is_valid_numeric(unit_cost):
        flash("Invalid numeric value entered!", "error")
        return redirect('/owner/dashboard')

    conn   = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO inventory (item_name, category, unit, quant_stock, reorder_level, unit_cost, artist_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (item_name, category, unit, float(quant_stock), float(reorder_level), float(unit_cost), artist_id))
        conn.commit()
        flash(f"'{item_name}' added to inventory successfully!", "success")
    except Exception as e:
        flash(f"Error adding inventory item: {str(e)}", "error")
    return redirect('/owner/dashboard')


@owner_bp.route('/owner/inventory/update/<int:item_id>', methods=['POST'])
@role_required('owner')
def owner_inventory_update(item_id):
    """Owner restocks or overrides stock for any inventory item."""
    action      = request.form.get('action', '').strip()
    quant_stock = request.form.get('quant_stock', '').strip()

    if action not in ('add', 'set') or not quant_stock or not is_valid_numeric(quant_stock):
        flash("Invalid update request!", "error")
        return redirect('/owner/dashboard')

    qty    = float(quant_stock)
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM inventory WHERE item_id = %s", (item_id,))
    item = cursor.fetchone()
    if not item:
        flash("Inventory item not found!", "error")
        return redirect('/owner/dashboard')

    if action == 'add':
        cursor.execute("UPDATE inventory SET quant_stock = quant_stock + %s WHERE item_id = %s", (qty, item_id))
        flash(f"Restocked '{item['item_name']}' by {qty} {item['unit']}.", "success")
    else:
        cursor.execute("UPDATE inventory SET quant_stock = %s WHERE item_id = %s", (qty, item_id))
        flash(f"'{item['item_name']}' stock set to {qty} {item['unit']}.", "success")
    conn.commit()
    return redirect('/owner/dashboard')


@owner_bp.route('/owner/inventory/delete/<int:item_id>', methods=['POST'])
@role_required('owner')
def owner_inventory_delete(item_id):
    """Owner permanently removes an inventory item."""
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT item_name FROM inventory WHERE item_id = %s", (item_id,))
    item = cursor.fetchone()
    if not item:
        flash("Inventory item not found!", "error")
        return redirect('/owner/dashboard')
    cursor.execute("DELETE FROM inventory WHERE item_id = %s", (item_id,))
    conn.commit()
    flash(f"'{item['item_name']}' deleted from inventory.", "success")
    return redirect('/owner/dashboard')


# ── INVOICE GENERATION ────────────────────────────────────────
@owner_bp.route('/owner/invoice/generate', methods=['POST'])
@role_required('owner')
def owner_invoice_generate():

    appointment_id = request.form.get('appointment_id', '').strip()
    total_amt      = request.form.get('total_amt', '').strip()
    concept_type   = request.form.get('concept_type', '').strip()
    generated_date = request.form.get('generated_date', '').strip()

    if not all([appointment_id, total_amt, concept_type, generated_date]):
        flash("Please fill in all invoice fields!", "error")
        return redirect('/owner/dashboard')

    if not is_valid_numeric(total_amt):
        flash("Invalid amount entered!", "error")
        return redirect('/owner/dashboard')

    total_amt = float(total_amt)
    if total_amt <= 0:
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
        pass
    return redirect('/owner/dashboard')

# ── PAYMENT PROCESSING (Record, Approve, Reject) ──────────────
@owner_bp.route('/owner/payment/record', methods=['POST'])
@role_required('owner')
def owner_payment_record():

    invoice_id     = request.form.get('invoice_id', '').strip()
    amount_paid    = request.form.get('amount_paid', '').strip()
    payment_method = request.form.get('payment_method', '').strip()
    payment_date   = request.form.get('payment_date', '').strip()

    if not all([invoice_id, amount_paid, payment_method, payment_date]):
        flash("Please fill in all payment fields!", "error")
        return redirect('/owner/dashboard')

    if not is_valid_numeric(amount_paid):
        flash("Invalid payment amount!", "error")
        return redirect('/owner/dashboard')

    amount_paid = float(amount_paid)
    if amount_paid <= 0:
        flash("Invalid payment amount!", "error")
        return redirect('/owner/dashboard')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT pay_status FROM invoice WHERE invoice_id = %s", (invoice_id,)
    )
    invoice = cursor.fetchone()

    if not invoice:
        flash("Invoice not found!", "error")
        return redirect('/owner/dashboard')
    if invoice['pay_status'] == 'Paid':
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
    flash("Payment recorded and invoice marked as Paid!", "success")
    return redirect('/owner/dashboard')

@owner_bp.route('/owner/payment/approve/<int:payment_id>', methods=['POST'])
@role_required('owner')
def owner_payment_approve(payment_id):

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.*, i.invoice_id FROM payment p
        JOIN invoice i ON p.invoice_id = i.invoice_id
        WHERE p.payment_id = %s
    """, (payment_id,))
    payment = cursor.fetchone()

    if not payment:
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
    flash("Payment approved! Invoice is now marked as Paid.", "success")
    return redirect('/owner/dashboard')

@owner_bp.route('/owner/payment/reject/<int:payment_id>', methods=['POST'])
@role_required('owner')
def owner_payment_reject(payment_id):

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.*, i.invoice_id FROM payment p
        JOIN invoice i ON p.invoice_id = i.invoice_id
        WHERE p.payment_id = %s
    """, (payment_id,))
    payment = cursor.fetchone()

    if not payment:
        flash("Payment record not found!", "error")
        return redirect('/owner/dashboard')

    invoice_id = payment['invoice_id']
    cursor.execute("DELETE FROM payment WHERE payment_id = %s", (payment_id,))
    cursor.execute(
        "UPDATE invoice SET pay_status = 'Pending' WHERE invoice_id = %s",
        (invoice_id,)
    )
    conn.commit()
    flash("Payment rejected. Invoice has been returned to Pending.", "success")
    return redirect('/owner/dashboard')

# ── OWNER ACCOUNT SETTINGS ───────────────────────────────────
@owner_bp.route('/owner/change-password', methods=['POST'])
@role_required('owner')
def owner_change_password():

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
        flash("Current password is incorrect!", "error")
        return redirect('/owner/dashboard')

    cursor.execute(
        "UPDATE owner SET password = %s WHERE owner_id = %s",
        (new_pass, session['user_id'])
    )
    conn.commit()
    flash("Password updated successfully!", "success")
    return redirect('/owner/dashboard')

# ── INVOICE VIEWER (Public/Shared) ───────────────────────────
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
        flash("Invoice not found!", "error")
        return redirect('/customer/dashboard' if role == 'customer' else '/owner/dashboard')

    if role == 'customer':
        cursor.execute(
            "SELECT a.customer_id FROM appointment a WHERE a.appointment_id = %s",
            (invoice['appointment_id'],)
        )
        appt_check = cursor.fetchone()
        if not appt_check or appt_check['customer_id'] != session['user_id']:
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

    extra = {}
    if appointment and appointment.get('extra_details'):
        try:
            extra = json.loads(appointment['extra_details'])
        except Exception:
            extra = {}

    return render_template('billing/bill.html',
        invoice     = sanitize_for_json(invoice),
        appointment = sanitize_for_json(appointment),
        payment     = sanitize_for_json(payment),
        extra       = extra,
        role        = role
    )
