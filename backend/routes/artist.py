import os
import time
from datetime import date
from werkzeug.utils import secure_filename
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
from ..utils.decorators import role_required
from ..utils.validators import (
    allowed_file,
    validate_image_size,
    is_valid_numeric,
    validate_fields,
)
from ..utils.serializers import sanitize_for_json

artist_bp = Blueprint("artist", __name__)


# ── ARTIST DASHBOARD ──────────────────────────────────────────
@artist_bp.route("/artist/dashboard")
@role_required("artist")
def artist_dashboard():
    artist_id = session["user_id"]
    conn = get_db()
    
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute(
            """
            SELECT a.*, c.customer_name FROM appointment a
            JOIN customer c ON a.customer_id = c.customer_id
            WHERE a.artist_id = %s ORDER BY a.appointment_date ASC
        """,
            (artist_id,),
        )
        appointments = cursor.fetchall()
        
        # Standardize date/time objects for JSON-safe template rendering
        appointments = sanitize_for_json(appointments)

        # CORE FEATURE: Only fetch inventory items belonging to THIS artist
        cursor.execute(
            "SELECT * FROM inventory WHERE artist_id = %s ORDER BY category, item_name",
            (artist_id,),
        )
        inventory = cursor.fetchall()

        cursor.execute(
            "SELECT * FROM gallery WHERE artist_id = %s ORDER BY uploaded_at DESC",
            (artist_id,),
        )
        gallery = cursor.fetchall()

        cursor.execute("SELECT * FROM artist WHERE artist_id = %s", (artist_id,))
        artist_profile = cursor.fetchone()

        # FETCH: Recent consumption logs for this artist
        cursor.execute(
            """
            SELECT ul.*, i.item_name, i.unit 
            FROM inventory_usage ul
            JOIN inventory i ON ul.item_id = i.item_id
            WHERE ul.artist_id = %s
            ORDER BY ul.logged_at DESC LIMIT 10
        """,
            (artist_id,),
        )
        usage_logs = cursor.fetchall()
        usage_logs = sanitize_for_json(usage_logs)

    # Stats
    total_count = len(appointments)
    pending_count = sum(1 for a in appointments if a["status"] == "Pending")
    done_count = sum(1 for a in appointments if a["status"] == "Done")
    low_stock = sum(
        1
        for item in inventory
        if (item.get("quant_stock") or 0) <= (item.get("reorder_level") or 0)
    )
    today_str = date.today().strftime("%Y-%m-%d")
    today_count = sum(
        1 for a in appointments if str(a["appointment_date"]) == today_str
    )

    return render_template(
        "artist/dashboard.html",
        name=session["name"],
        artist_profile=artist_profile,
        appointments=appointments,
        inventory=inventory,
        usage_logs=usage_logs,
        my_gallery=gallery,
        total_count=total_count,
        pending_count=pending_count,
        done_count=done_count,
        low_stock=low_stock,
        today_count=today_count,
    )


# ── APPOINTMENT ACTIONS ────────────────────────────────────────
@artist_bp.route("/artist/approve/<int:appointment_id>", methods=["POST"])
@role_required("artist")
def artist_approve(appointment_id):
    duration = request.form.get("duration_hours", "").strip()
    missing = validate_fields(request.form, ["duration_hours"])
    if missing or not is_valid_numeric(duration):
        flash("Please provide a valid session duration!", "error")
        return redirect("/artist/dashboard")

    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE appointment SET status = 'Approved', duration_hours = %s WHERE appointment_id = %s AND artist_id = %s",
            (duration, appointment_id, session["user_id"]),
        )
        conn.commit()
    flash("Appointment approved and duration set!", "success")
    return redirect("/artist/dashboard")


@artist_bp.route("/artist/reject/<int:appointment_id>", methods=["POST"])
@role_required("artist")
def artist_reject(appointment_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE appointment SET status = 'Rejected' WHERE appointment_id = %s AND artist_id = %s",
            (appointment_id, session["user_id"]),
        )
        conn.commit()
    flash("Appointment rejected.", "success")
    return redirect("/artist/dashboard")


@artist_bp.route("/artist/done/<int:appointment_id>", methods=["POST"])
@role_required("artist")
def artist_done(appointment_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE appointment SET status = 'Done' WHERE appointment_id = %s AND artist_id = %s",
            (appointment_id, session["user_id"]),
        )
        conn.commit()
    flash("Mission accomplished! Appointment marked as Done.", "success")
    return redirect("/artist/dashboard")


# ── INVENTORY MANAGEMENT (Artist-specific CRUD) ───────────────


@artist_bp.route("/artist/inventory/add", methods=["POST"])
@role_required("artist")
def artist_inventory_add():
    """Add a new supply item to THIS artist's personal inventory."""
    required = ["item_name", "category", "unit", "quant_stock", "reorder_level", "unit_cost"]
    missing = validate_fields(request.form, required)
    if missing:
        flash("Please fill in all supply fields!", "error")
        return redirect("/artist/dashboard")

    item_name = request.form.get("item_name", "").strip()
    category = request.form.get("category", "").strip()
    unit = request.form.get("unit", "").strip()
    quant_stock = request.form.get("quant_stock", "").strip()
    reorder_level = request.form.get("reorder_level", "").strip()
    unit_cost = request.form.get("unit_cost", "").strip()

    if (
        not is_valid_numeric(quant_stock)
        or not is_valid_numeric(reorder_level)
        or not is_valid_numeric(unit_cost)
    ):
        flash("Invalid numeric value in supply form!", "error")
        return redirect("/artist/dashboard")

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        try:
            # [UNIT-LOGIC]
            countable_units = ['Pieces', 'Pairs', 'Box', 'Units', 'Pack', 'Needles']
            is_countable = unit in countable_units
            
            final_quant = int(round(float(quant_stock))) if is_countable else float(quant_stock)
            final_reorder = int(round(float(reorder_level))) if is_countable else float(reorder_level)

            cursor.execute(
                """
                INSERT INTO inventory (item_name, category, unit, quant_stock, reorder_level, unit_cost, artist_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
                (
                    item_name,
                    category,
                    unit,
                    final_quant,
                    final_reorder,
                    float(unit_cost),
                    session["user_id"],
                ),
            )
            conn.commit()
            flash(f"'{item_name}' added to your inventory!", "success")
        except Exception as e:
            current_app.logger.error(f"Inventory add error: {e}")
            flash("Failed to add supply item. Please try again.", "error")
    return redirect("/artist/dashboard")


@artist_bp.route("/artist/inventory/update/<int:item_id>", methods=["POST"])
@role_required("artist")
def artist_inventory_update(item_id):
    """Restock or set exact quantity for an item in THIS artist's inventory."""
    action = request.form.get("action", "").strip()  # 'add' or 'set'
    quant_stock = request.form.get("quant_stock", "").strip()

    if (
        action not in ("add", "set")
        or not quant_stock
        or not is_valid_numeric(quant_stock)
    ):
        flash("Invalid update request!", "error")
        return redirect("/artist/dashboard")

    qty = float(quant_stock)
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        # SECURITY: Verify this item belongs to the logged-in artist
        cursor.execute(
            "SELECT * FROM inventory WHERE item_id = %s AND artist_id = %s",
            (item_id, session["user_id"]),
        )
        item = cursor.fetchone()
        if not item:
            flash("Item not found or access denied!", "error")
            return redirect("/artist/dashboard")

        # [UNIT-LOGIC]
        countable_units = ['Pieces', 'Pairs', 'Box', 'Units', 'Pack', 'Needles']
        if item['unit'] in countable_units:
            qty = int(round(qty))

        if action == "add":
            cursor.execute(
                "UPDATE inventory SET quant_stock = quant_stock + %s WHERE item_id = %s",
                (qty, item_id),
            )
            flash(f"Restocked '{item['item_name']}' by {qty} {item['unit']}.", "success")
        else:
            if qty < 0:
                flash("Stock quantity cannot be negative!", "error")
                return redirect("/artist/dashboard")
            cursor.execute(
                "UPDATE inventory SET quant_stock = %s WHERE item_id = %s", (qty, item_id)
            )
            flash(f"'{item['item_name']}' stock set to {qty} {item['unit']}.", "success")

        conn.commit()
    return redirect("/artist/dashboard")


@artist_bp.route("/artist/inventory/delete/<int:item_id>", methods=["POST"])
@role_required("artist")
def artist_inventory_delete(item_id):
    """Permanently remove a supply item from THIS artist's inventory."""
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        # SECURITY: Verify ownership before deletion
        cursor.execute(
            "SELECT * FROM inventory WHERE item_id = %s AND artist_id = %s",
            (item_id, session["user_id"]),
        )
        item = cursor.fetchone()
        if not item:
            flash("Item not found or access denied!", "error")
            return redirect("/artist/dashboard")

        cursor.execute("DELETE FROM inventory WHERE item_id = %s", (item_id,))
        conn.commit()
    flash(f"'{item['item_name']}' removed from your inventory.", "success")
    return redirect("/artist/dashboard")


@artist_bp.route("/artist/inventory/use", methods=["POST"])
@role_required("artist")
def artist_use_inventory():
    """Log usage of a supply item (deducts from stock)."""
    item_id = request.form.get("item_id", "").strip()
    quant = request.form.get("quantity", "").strip()

    if not item_id or not quant or not is_valid_numeric(quant):
        flash("Invalid inventory usage details!", "error")
        return redirect("/artist/dashboard")

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        # SECURITY: Only allow use on artist's OWN items
        cursor.execute(
            "SELECT * FROM inventory WHERE item_id = %s AND artist_id = %s",
            (item_id, session["user_id"]),
        )
        item = cursor.fetchone()

        if not item:
            flash("Inventory item not found or access denied!", "error")
            return redirect("/artist/dashboard")

        # [UNIT-LOGIC]: Define countable vs measurable units
        countable_units = ['Pieces', 'Pairs', 'Box', 'Units', 'Pack', 'Needles']
        is_countable = item['unit'] in countable_units

        if is_countable:
            quant = int(round(float(quant)))  # Enforce integer for countable items
        else:
            quant = float(quant)

        if item["quant_stock"] < quant:
            flash(
                f"Not enough stock! Only {item['quant_stock']} {item['unit']} "
                f"available for {item['item_name']}.",
                "error",
            )
            return redirect("/artist/dashboard")

        cursor.execute(
            "UPDATE inventory SET quant_stock = quant_stock - %s WHERE item_id = %s",
            (quant, item_id),
        )
        
        # LOG: Record the consumption in inventory_usage table
        appt_id = request.form.get("appointment_id")
        cursor.execute(
            """
            INSERT INTO inventory_usage (appointment_id, item_id, qty_used, artist_id)
            VALUES (%s, %s, %s, %s)
            """,
            (appt_id, item_id, quant, session["user_id"]),
        )
        
        conn.commit()
    flash(f"Logged usage of {quant} {item['unit']} of {item['item_name']}.", "success")
    return redirect("/artist/dashboard")


# ── GALLERY MANAGEMENT ─────────────────────────────────────────
@artist_bp.route("/artist/gallery/upload", methods=["POST"])
@role_required("artist")
def artist_gallery_upload():
    caption = request.form.get("caption", "").strip()
    style = request.form.get("style", "").strip()
    image = request.files.get("gallery_image")

    if not image:
        flash("Please provide an image!", "error")
        return redirect("/artist/dashboard")

    if not allowed_file(image.filename):
        flash("Invalid file format! Use PNG, JPG, or JPEG.", "error")
        return redirect("/artist/dashboard")

    if not validate_image_size(image):
        flash("Image size must be under 5MB!", "error")
        return redirect("/artist/dashboard")

    ext = image.filename.rsplit(".", 1)[1].lower()
    filename = secure_filename(f"art_{session['user_id']}_{int(time.time())}.{ext}")
    save_path = os.path.join(current_app.static_folder, "uploads", "gallery", filename)
    image.save(save_path)

    image_rel_path = f"uploads/gallery/{filename}"
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO gallery (artist_id, image_path, caption, style)
            VALUES (%s, %s, %s, %s)
        """,
            (session["user_id"], image_rel_path, caption, style),
        )
        conn.commit()

    flash("Masterpiece added to your gallery!", "success")
    return redirect("/artist/dashboard")


@artist_bp.route("/artist/gallery/delete/<int:gallery_id>", methods=["POST"])
@role_required("artist")
def artist_gallery_delete(gallery_id):
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute(
            "SELECT image_path FROM gallery WHERE gallery_id = %s AND artist_id = %s",
            (gallery_id, session["user_id"]),
        )
        img = cursor.fetchone()

        if not img:
            flash("Image not found or access denied!", "error")
            return redirect("/artist/dashboard")

        if img["image_path"]:
            fp = os.path.join(current_app.static_folder, img["image_path"])
            if os.path.exists(fp):
                try:
                    os.remove(fp)
                except Exception:
                    pass

        cursor.execute("DELETE FROM gallery WHERE gallery_id = %s", (gallery_id,))
        conn.commit()
    flash("Image removed from gallery.", "success")
    return redirect("/artist/dashboard")
