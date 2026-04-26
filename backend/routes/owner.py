import os
import json
from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    session,
    flash,
    current_app,
)
from datetime import date, datetime, timedelta
from ..db import get_db
from ..utils.decorators import role_required
from ..utils.validators import is_valid_numeric, validate_fields
from ..utils.serializers import sanitize_for_json
from ..utils.metrics import get_dashboard_stats, get_performance_data

owner_bp = Blueprint("owner", __name__)




# Dashboard logic now uses imports from ..utils.metrics


# ── MAIN OWNER DASHBOARD ROUTE ───────────────────────────────
@owner_bp.route("/owner/dashboard")
@role_required("owner")
def owner_dashboard():
    """Aggregates all studio data into one main control panel for the owner."""
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
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
            lu = item.get("last_updated")
            item["last_updated_str"] = lu.strftime("%Y-%m-%d") if lu else ""

        # Aggregates & Performance
        stats = get_dashboard_stats(cursor)
        perf = get_performance_data(cursor)

        # FETCH: Recent consumption logs (Global for owner)
        cursor.execute(
            """
            SELECT ul.*, i.item_name, i.unit, ar.artist_name 
            FROM inventory_usage ul
            JOIN inventory i ON ul.item_id = i.item_id
            JOIN artist ar ON ul.artist_id = ar.artist_id
            ORDER BY ul.logged_at DESC LIMIT 20
        """
        )
        usage_logs = cursor.fetchall()
        usage_logs = sanitize_for_json(usage_logs)

    # Derived Python Stats
    low_stock_items = [
        i
        for i in inventory
        if (i.get("quant_stock") or 0) <= (i.get("reorder_level") or 0)
    ]
    total_revenue = sum(
        (p.get("amount_paid") or 0) for p in payments if p.get("status") == "Approved"
    )

    return render_template(
        "owner/dashboard.html",
        name=session["name"],
        appointments=sanitize_for_json(appointments),
        artists=sanitize_for_json(artists),
        invoices=sanitize_for_json(invoices),
        payments=sanitize_for_json(payments),
        inventory=sanitize_for_json(inventory),
        usage_logs=usage_logs,
        artist_performance=sanitize_for_json(perf["artist_performance"]),
        payment_methods=sanitize_for_json(perf["payment_methods"]),
        daily_revenue=sanitize_for_json(perf["daily_revenue"]),
        concept_trends=sanitize_for_json(perf["concept_trends"]),
        total_appointments=len(appointments),
        pending_count=sum(1 for a in appointments if a["status"] == "Pending"),
        approved_count=sum(1 for a in appointments if a["status"] == "Approved"),
        done_count=sum(1 for a in appointments if a["status"] == "Done"),
        rejected_count=sum(1 for a in appointments if a["status"] == "Rejected"),
        cancelled_count=sum(1 for a in appointments if a["status"] == "Cancelled"),
        total_artists=len(artists),
        low_stock=len(low_stock_items),
        low_stock_items=sanitize_for_json(low_stock_items),
        unpaid_invoices=sum(1 for i in invoices if i["pay_status"] == "Pending"),
        total_invoices=len(invoices),
        total_revenue=total_revenue,
        paid_revenue=total_revenue,
        total_customers=stats["total_customers"],
        pending_approvals=sum(
            1 for p in payments if p.get("status") == "Pending Approval"
        ),
        returning_customers=stats["returning_customers"],
        monthly_revenue=stats["monthly_revenue"],
        monthly_target=stats["monthly_target"],
        pending_revenue=sum(
            (i.get("total_amt") or 0)
            for i in invoices
            if i["pay_status"] in ("Pending", "Under Review")
        ),
    )


@owner_bp.route("/owner/update-target", methods=["POST"])
@role_required("owner")
def update_monthly_target():
    target = request.json.get("target") if request.is_json else request.form.get("target")

    if not target or not is_valid_numeric(target):
        return json.dumps({"status": "error", "message": "Invalid target value"}), 400

    conn = get_db()
    with conn.cursor() as cursor:
        try:
            cursor.execute("UPDATE owner SET monthly_target = %s", (target,))
            conn.commit()
            return json.dumps({"status": "success", "message": "Monthly target updated"})
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)}), 500


# ── APPOINTMENT ACTIONS ──────────────────────────────────────
@owner_bp.route("/owner/cancel/<int:appointment_id>", methods=["POST"])
@role_required("owner")
def owner_cancel(appointment_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE appointment SET status = 'Cancelled' WHERE appointment_id = %s",
            (appointment_id,),
        )
        conn.commit()
    flash("Appointment cancelled successfully.", "success")
    return redirect("/owner/dashboard")


@owner_bp.route("/owner/delete-invoice/<int:invoice_id>", methods=["POST"])
@role_required("owner")
def owner_delete_invoice(invoice_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM invoice WHERE invoice_id = %s", (invoice_id,))
        conn.commit()
    flash("Invoice deleted.", "success")
    return redirect("/owner/reports")


# ── ARTIST MANAGEMENT (Add/Delete/List) ──────────────────────
@owner_bp.route("/owner/artist/add", methods=["POST"])
@role_required("owner")
def owner_artist_add():
    required = ["artist_id", "artist_name", "artist_email", "password", "phone", "specialisation"]
    missing = validate_fields(request.form, required)
    if missing:
        flash("Please fill in all required fields!", "error")
        return redirect("/owner/dashboard")

    artist_id = request.form.get("artist_id", "").strip()
    artist_name = request.form.get("artist_name", "").strip()
    artist_email = request.form.get("artist_email", "").strip()
    password = request.form.get("password", "").strip()
    phone = request.form.get("phone", "").strip()
    specialisation = request.form.get("specialisation", "").strip()
    if len(password) < 8:
        flash("Artist password must be at least 8 characters!", "error")
        return redirect("/owner/dashboard")

    conn = get_db()
    with conn.cursor() as cursor:
        try:
            cursor.execute(
                """
                INSERT INTO artist
                (artist_id, artist_name, artist_email, password, phone, specialisation)
                VALUES (%s, %s, %s, %s, %s, %s)
            """,
                (artist_id, artist_name, artist_email, password, phone, specialisation),
            )
            conn.commit()
            flash(f"Artist '{artist_name}' added successfully!", "success")
        except Exception:
            flash("Error: Artist ID or email already exists!", "error")
    return redirect("/owner/dashboard")


@owner_bp.route("/owner/artist/delete/<artist_id>", methods=["POST"])
@role_required("owner")
def owner_artist_delete(artist_id):
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT image_path FROM gallery WHERE artist_id = %s", (artist_id,))
        for img in cursor.fetchall():
            if img["image_path"]:
                fp = os.path.join(current_app.static_folder, img["image_path"])
                if os.path.exists(fp):
                    try:
                        os.remove(fp)
                    except Exception:
                        pass

        cursor.execute("SELECT artist_name FROM artist WHERE artist_id = %s", (artist_id,))
        artist = cursor.fetchone()
        artist_name = artist["artist_name"] if artist else artist_id

        try:
            # 1. Clean up gallery images from database
            cursor.execute("DELETE FROM gallery WHERE artist_id = %s", (artist_id,))

            # 1.5 Clean up orphaned messages
            cursor.execute(
                "DELETE FROM messages WHERE sender_id = %s OR receiver_id = %s",
                (artist_id, artist_id),
            )

            # 2. Delete the artist (SQL Foreign Key CASCADE will handle appointments)
            cursor.execute("DELETE FROM artist WHERE artist_id = %s", (artist_id,))

            conn.commit()
            flash(
                f"Artist '{artist_name}' and all their gallery images have been removed.",
                "success",
            )
        except Exception as e:
            conn.rollback()
            # If the user hasn't run the SQL script yet, catch the foreign key error specifically
            if "1451" in str(e):
                flash(
                    f"Cannot delete artist '{artist_name}' because they have active appointments or dependencies. Have you applied the SQL migration script in MySQL Workbench?",
                    "error",
                )
            else:
                flash(f"An error occurred: {str(e)}", "error")

    return redirect("/owner/dashboard")


# ── OWNER INVENTORY MANAGEMENT ───────────────────────────────
@owner_bp.route("/owner/inventory/add", methods=["POST"])
@role_required("owner")
def owner_inventory_add():
    """Owner adds a supply item to a specific artist's inventory."""
    item_name = request.form.get("item_name", "").strip()
    category = request.form.get("category", "").strip()
    unit = request.form.get("unit", "").strip()
    quant_stock = request.form.get("quant_stock", "").strip()
    reorder_level = request.form.get("reorder_level", "").strip()
    unit_cost = request.form.get("unit_cost", "").strip()
    artist_id = request.form.get("artist_id", "").strip() or None

    if not all([item_name, category, unit, quant_stock, reorder_level, unit_cost]):
        flash("Please fill in all required inventory fields!", "error")
        return redirect("/owner/dashboard")

    if (
        not is_valid_numeric(quant_stock)
        or not is_valid_numeric(reorder_level)
        or not is_valid_numeric(unit_cost)
    ):
        flash("Invalid numeric value entered!", "error")
        return redirect("/owner/dashboard")

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        try:
            # [UNIT-LOGIC]: Define countable units
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
                    artist_id,
                ),
            )
            conn.commit()
            flash(f"'{item_name}' added to inventory successfully!", "success")
        except Exception as e:
            flash(f"Error adding inventory item: {str(e)}", "error")
    return redirect("/owner/dashboard")


@owner_bp.route("/owner/inventory/update/<int:item_id>", methods=["POST"])
@role_required("owner")
def owner_inventory_update(item_id):
    """Owner restocks or overrides stock for any inventory item."""
    action = request.form.get("action", "").strip()
    quant_stock = request.form.get("quant_stock", "").strip()

    if (
        action not in ("add", "set")
        or not quant_stock
        or not is_valid_numeric(quant_stock)
    ):
        flash("Invalid update request!", "error")
        return redirect("/owner/dashboard")

    qty = float(quant_stock)
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM inventory WHERE item_id = %s", (item_id,))
        item = cursor.fetchone()
        if not item:
            flash("Inventory item not found!", "error")
            return redirect("/owner/dashboard")

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
            cursor.execute(
                "UPDATE inventory SET quant_stock = %s WHERE item_id = %s", (qty, item_id)
            )
            flash(f"'{item['item_name']}' stock set to {qty} {item['unit']}.", "success")
        conn.commit()
    return redirect("/owner/dashboard")


@owner_bp.route("/owner/inventory/delete/<int:item_id>", methods=["POST"])
@role_required("owner")
def owner_inventory_delete(item_id):
    """Owner permanently removes an inventory item."""
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT item_name FROM inventory WHERE item_id = %s", (item_id,))
        item = cursor.fetchone()
        if not item:
            flash("Inventory item not found!", "error")
            return redirect("/owner/dashboard")
        cursor.execute("DELETE FROM inventory WHERE item_id = %s", (item_id,))
        conn.commit()
    flash(f"'{item['item_name']}' deleted from inventory.", "success")
    return redirect("/owner/dashboard")


# ── INVOICE GENERATION ────────────────────────────────────────
@owner_bp.route("/owner/generate-invoice", methods=["POST"])
@role_required("owner")
def owner_generate_invoice():
    appt_id = request.form.get("appointment_id")
    base_amt = request.form.get("base_amount", "0")
    tax_amt = request.form.get("tax_amount", "0")
    total_amt = request.form.get("total_amount", "0")

    if not appt_id or not total_amt or float(total_amt) <= 0:
        flash("Invalid invoice details!", "error")
        return redirect("/owner/dashboard")

    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO invoice (appointment_id, base_amt, tax_amt, total_amt, generated_date, pay_status)
            VALUES (%s, %s, %s, %s, CURDATE(), 'Unpaid')
        """, (appt_id, base_amt, tax_amt, total_amt))
        conn.commit()
    flash("Invoice generated successfully!", "success")
    return redirect("/owner/dashboard")


# ── PAYMENT PROCESSING (Record, Approve, Reject) ──────────────
@owner_bp.route("/owner/payment/record", methods=["POST"])
@role_required("owner")
def owner_payment_record():
    invoice_id = request.form.get("invoice_id", "").strip()
    amount_paid = request.form.get("amount_paid", "").strip()
    payment_method = request.form.get("payment_method", "").strip()
    payment_date = request.form.get("payment_date", "").strip()

    if not all([invoice_id, amount_paid, payment_method, payment_date]):
        flash("Please fill in all payment fields!", "error")
        return redirect("/owner/dashboard")

    if not is_valid_numeric(amount_paid):
        flash("Invalid payment amount!", "error")
        return redirect("/owner/dashboard")

    amount_paid = float(amount_paid)
    if amount_paid <= 0:
        flash("Invalid payment amount!", "error")
        return redirect("/owner/dashboard")

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute(
            "SELECT pay_status FROM invoice WHERE invoice_id = %s", (invoice_id,)
        )
        invoice = cursor.fetchone()

        if not invoice:
            flash("Invoice not found!", "error")
            return redirect("/owner/dashboard")
        if invoice["pay_status"] == "Paid":
            flash("This invoice is already marked as paid!", "error")
            return redirect("/owner/dashboard")

        cursor.execute(
            """
            INSERT INTO payment
                (invoice_id, amount_paid, payment_method, payment_date, status)
            VALUES (%s, %s, %s, %s, 'Approved')
        """,
            (invoice_id, amount_paid, payment_method, payment_date),
        )
        cursor.execute(
            "UPDATE invoice SET pay_status = 'Paid' WHERE invoice_id = %s", (invoice_id,)
        )
        conn.commit()
    flash("Payment recorded and invoice marked as Paid!", "success")
    return redirect("/owner/dashboard")


@owner_bp.route("/owner/confirm-payment/<int:payment_id>", methods=["POST"])
@role_required("owner")
def owner_confirm_payment(payment_id):
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM payment WHERE payment_id = %s", (payment_id,))
        payment = cursor.fetchone()

        if not payment:
            flash("Payment record not found!", "error")
            return redirect("/owner/dashboard")

        # 1. Update Payment status
        cursor.execute("UPDATE payment SET status = 'Approved' WHERE payment_id = %s", (payment_id,))

        # 2. Update Invoice status
        cursor.execute("UPDATE invoice SET pay_status = 'Paid' WHERE invoice_id = %s", (payment["invoice_id"],))

        conn.commit()
    flash("Payment confirmed and invoice marked as Paid!", "success")
    return redirect("/owner/dashboard")


@owner_bp.route("/owner/payment/reject/<int:payment_id>", methods=["POST"])
@role_required("owner")
def owner_payment_reject(payment_id):
    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute(
            """
            SELECT p.*, i.invoice_id FROM payment p
            JOIN invoice i ON p.invoice_id = i.invoice_id
            WHERE p.payment_id = %s
        """,
            (payment_id,),
        )
        payment = cursor.fetchone()

        if not payment:
            flash("Payment record not found!", "error")
            return redirect("/owner/dashboard")

        invoice_id = payment["invoice_id"]
        cursor.execute("DELETE FROM payment WHERE payment_id = %s", (payment_id,))
        cursor.execute(
            "UPDATE invoice SET pay_status = 'Pending' WHERE invoice_id = %s", (invoice_id,)
        )
        conn.commit()
    flash("Payment rejected. Invoice has been returned to Pending.", "success")
    return redirect("/owner/dashboard")


@owner_bp.route("/owner/change-password", methods=["POST"])
@role_required("owner")
def owner_change_password():
    current = request.form.get("current_password", "").strip()
    new_pass = request.form.get("new_password", "").strip()
    confirm = request.form.get("confirm_password", "").strip()

    if not all([current, new_pass, confirm]):
        flash("Please fill in all password fields!", "error")
        return redirect("/owner/dashboard")
    if new_pass != confirm:
        flash("New passwords do not match!", "error")
        return redirect("/owner/dashboard")
    if len(new_pass) < 8:
        flash("New password must be at least 8 characters!", "error")
        return redirect("/owner/dashboard")

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute(
            "SELECT * FROM owner WHERE password = %s",
            (current,),
        )
        if not cursor.fetchone():
            flash("Current password is incorrect!", "error")
            return redirect("/owner/dashboard")

        cursor.execute(
            "UPDATE owner SET password = %s",
            (new_pass,),
        )
        conn.commit()
    flash("Password updated successfully!", "success")
    return redirect("/owner/dashboard")


# ── INVOICE VIEWER (Public/Shared) ───────────────────────────
@owner_bp.route("/invoice/view/<int:invoice_id>")
def invoice_view(invoice_id):
    role = session.get("role")
    if role not in ("customer", "owner"):
        return redirect("/login")

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM invoice WHERE invoice_id = %s", (invoice_id,))
        invoice = cursor.fetchone()

        if not invoice:
            flash("Invoice not found!", "error")
            return redirect(
                "/customer/dashboard" if role == "customer" else "/owner/dashboard"
            )

        if role == "customer":
            cursor.execute(
                "SELECT a.customer_id FROM appointment a WHERE a.appointment_id = %s",
                (invoice["appointment_id"],),
            )
            appt_check = cursor.fetchone()
            if not appt_check or appt_check["customer_id"] != session["user_id"]:
                flash("Access denied!", "error")
                return redirect("/customer/dashboard")

        cursor.execute(
            """
            SELECT a.*, c.customer_name, ar.artist_name FROM appointment a
            JOIN customer c  ON a.customer_id = c.customer_id
            JOIN artist   ar ON a.artist_id   = ar.artist_id
            WHERE a.appointment_id = %s
        """,
            (invoice["appointment_id"],),
        )
        appointment = cursor.fetchone()

        cursor.execute(
            "SELECT * FROM payment WHERE invoice_id = %s ORDER BY payment_date DESC LIMIT 1",
            (invoice_id,),
        )
        payment = cursor.fetchone()

    extra = {}
    if appointment and appointment.get("extra_details"):
        try:
            extra = json.loads(appointment["extra_details"])
        except Exception:
            extra = {}

    return render_template(
        "billing/bill.html",
        invoice=sanitize_for_json(invoice),
        appointment=sanitize_for_json(appointment),
        payment=sanitize_for_json(payment),
        extra=extra,
        role=role,
    )
