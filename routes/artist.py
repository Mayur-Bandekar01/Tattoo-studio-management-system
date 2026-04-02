# routes/artist.py
import os
import time
from werkzeug.utils import secure_filename
from flask import Blueprint, render_template, request, redirect, session, flash, current_app
from db import get_db

artist_bp = Blueprint('artist', __name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}

@artist_bp.route('/artist/dashboard')
def artist_dashboard():
    if session.get('role') != 'artist':
        return redirect('/login')

    artist_id = session['user_id']
    conn      = get_db()
    cursor    = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT a.*, c.customer_name FROM appointment a
        JOIN customer c ON a.customer_id = c.customer_id
        WHERE a.artist_id = %s ORDER BY a.appointment_date DESC
    """, (artist_id,))
    appointments = cursor.fetchall()

    cursor.execute("""
        SELECT a.*, c.customer_name FROM appointment a
        JOIN customer c ON a.customer_id = c.customer_id
        WHERE a.artist_id = %s AND a.appointment_date = CURDATE()
          AND a.status IN ('Approved', 'Done')
        ORDER BY a.appointment_time
    """, (artist_id,))
    today_appointments = cursor.fetchall()

    cursor.execute("SELECT * FROM inventory ORDER BY category, item_name")
    inventory = cursor.fetchall()

    cursor.execute("""
        SELECT u.*, i.item_name FROM inventory_usage u
        JOIN inventory i   ON u.item_id        = i.item_id
        JOIN appointment a ON u.appointment_id = a.appointment_id
        WHERE a.artist_id = %s ORDER BY u.logged_at DESC
    """, (artist_id,))
    usage_logs = cursor.fetchall()

    cursor.execute("SELECT * FROM artist WHERE artist_id = %s", (artist_id,))
    artist_profile = cursor.fetchone()

    cursor.execute(
        "SELECT * FROM gallery WHERE artist_id = %s ORDER BY uploaded_at DESC",
        (artist_id,)
    )
    my_gallery = cursor.fetchall()

    pending_count = sum(1 for a in appointments if a['status'] == 'Pending')
    today_count   = len(today_appointments)
    done_count    = sum(1 for a in appointments if a['status'] == 'Done')
    low_stock     = sum(1 for i in inventory if i['quant_stock'] <= i['reorder_level'])
    total_count   = len(appointments)
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
        low_stock          = low_stock,
        total_count        = total_count
    )

@artist_bp.route('/artist/approve/<int:appointment_id>', methods=['POST'])
def artist_approve(appointment_id):
    if session.get('role') != 'artist':
        return redirect('/login')
    duration = request.form.get('duration_hours', '').strip()
    try:
        duration = int(duration)
        if duration <= 0: raise ValueError
    except (ValueError, TypeError):
        flash("Please enter a valid duration!", "error")
        return redirect('/artist/dashboard')

    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE appointment SET status = 'Approved', duration_hours = %s
        WHERE appointment_id = %s AND artist_id = %s AND status = 'Pending'
    """, (duration, appointment_id, session['user_id']))
    conn.commit()
    conn.close()
    flash("Appointment approved!", "success")
    return redirect('/artist/dashboard')

@artist_bp.route('/artist/reject/<int:appointment_id>', methods=['POST'])
def artist_reject(appointment_id):
    if session.get('role') != 'artist':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE appointment SET status = 'Rejected'
        WHERE appointment_id = %s AND artist_id = %s AND status = 'Pending'
    """, (appointment_id, session['user_id']))
    conn.commit()
    conn.close()
    flash("Appointment rejected.", "success")
    return redirect('/artist/dashboard')

@artist_bp.route('/artist/done/<int:appointment_id>', methods=['POST'])
def artist_done(appointment_id):
    if session.get('role') != 'artist':
        return redirect('/login')

    conn   = get_db()
    cursor = conn.cursor()

    # FIX: Added AND status = 'Approved' guard so only Approved appointments
    # can be marked Done. Previously any status (even Pending/Rejected) could
    # be marked done by crafting a direct POST request.
    cursor.execute("""
        UPDATE appointment SET status = 'Done'
        WHERE appointment_id = %s AND artist_id = %s AND status = 'Approved'
    """, (appointment_id, session['user_id']))

    if cursor.rowcount == 0:
        conn.close()
        flash("Only approved appointments can be marked as done.", "error")
        return redirect('/artist/dashboard')

    conn.commit()
    conn.close()
    flash("Session marked as done!", "success")
    return redirect('/artist/dashboard')

@artist_bp.route('/artist/inventory/add', methods=['POST'])
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
        request.form.get('item_name'), request.form.get('category'),
        request.form.get('unit'),      request.form.get('quant_stock'),
        request.form.get('reorder_level'), request.form.get('unit_cost')
    ))
    conn.commit()
    conn.close()
    flash("Inventory item added!", "success")
    return redirect('/artist/dashboard')

@artist_bp.route('/artist/inventory/update/<int:item_id>', methods=['POST'])
def artist_inventory_update(item_id):
    if session.get('role') != 'artist':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE inventory SET quant_stock = %s WHERE item_id = %s",
        (request.form.get('quant_stock'), item_id)
    )
    conn.commit()
    conn.close()
    flash("Stock updated!", "success")
    return redirect('/artist/dashboard')

@artist_bp.route('/artist/inventory/delete/<int:item_id>', methods=['POST'])
def artist_inventory_delete(item_id):
    if session.get('role') != 'artist':
        return redirect('/login')
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM inventory WHERE item_id = %s", (item_id,))
    conn.commit()
    conn.close()
    flash("Item deleted!", "success")
    return redirect('/artist/dashboard')

@artist_bp.route('/artist/log-usage', methods=['POST'])
def artist_log_usage():
    if session.get('role') != 'artist':
        return redirect('/login')

    appointment_id = request.form.get('appointment_id')
    item_id        = request.form.get('item_id')
    qty_used       = request.form.get('qty_used')

    try:
        qty_used = int(qty_used)
        if qty_used <= 0: raise ValueError
    except (ValueError, TypeError):
        flash("Invalid quantity entered!", "error")
        return redirect('/artist/dashboard')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT quant_stock, item_name FROM inventory WHERE item_id = %s",
        (item_id,)
    )
    item = cursor.fetchone()

    if not item:
        conn.close()
        flash("Inventory item not found!", "error")
        return redirect('/artist/dashboard')

    if qty_used > item['quant_stock']:
        conn.close()
        flash(
            f"Not enough stock! Only {item['quant_stock']} units "
            f"available for {item['item_name']}.",
            "error"
        )
        return redirect('/artist/dashboard')

    cursor.execute(
        "INSERT INTO inventory_usage (appointment_id, item_id, qty_used) VALUES (%s,%s,%s)",
        (appointment_id, item_id, qty_used)
    )
    cursor.execute(
        "UPDATE inventory SET quant_stock = quant_stock - %s WHERE item_id = %s",
        (qty_used, item_id)
    )
    conn.commit()
    conn.close()
    flash("Usage logged and stock updated!", "success")
    return redirect('/artist/dashboard')

@artist_bp.route('/artist/change-password', methods=['POST'])
def artist_change_password():
    if session.get('role') != 'artist':
        return redirect('/login')

    current  = request.form.get('current_password', '').strip()
    new_pass = request.form.get('new_password', '').strip()
    confirm  = request.form.get('confirm_password', '').strip()

    if new_pass != confirm:
        flash("New passwords do not match!", "error")
        return redirect('/artist/dashboard')
    if len(new_pass) < 8:
        flash("Password must be at least 8 characters!", "error")
        return redirect('/artist/dashboard')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM artist WHERE artist_id = %s AND password = %s",
        (session['user_id'], current)
    )
    if not cursor.fetchone():
        conn.close()
        flash("Current password is incorrect!", "error")
        return redirect('/artist/dashboard')

    cursor.execute(
        "UPDATE artist SET password = %s WHERE artist_id = %s",
        (new_pass, session['user_id'])
    )
    conn.commit()
    conn.close()
    flash("Password updated successfully!", "success")
    return redirect('/artist/dashboard')

@artist_bp.route('/artist/gallery/upload', methods=['POST'])
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

    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO gallery (artist_id, image_path, caption, style) VALUES (%s,%s,%s,%s)",
        (session['user_id'], f"uploads/gallery/{filename}", caption, style)
    )
    conn.commit()
    conn.close()
    flash("Image uploaded to gallery successfully!", "success")
    return redirect('/artist/dashboard')

@artist_bp.route('/artist/gallery/delete/<int:gallery_id>', methods=['POST'])
def artist_gallery_delete(gallery_id):
    if session.get('role') != 'artist':
        return redirect('/login')

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM gallery WHERE gallery_id = %s AND artist_id = %s",
        (gallery_id, session['user_id'])
    )
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