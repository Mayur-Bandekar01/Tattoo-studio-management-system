from ..utils.serializers import sanitize_for_json
from ..utils.metrics import get_dashboard_stats, get_performance_data
from datetime import datetime

def get_owner_dashboard_data(cursor):
    """
    Aggregates all studio data for the owner dashboard.
    Centralizes SQL logic to keep routes clean and address ISS-005.
    """
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
    
    # Process inventory dates
    for item in inventory:
        lu = item.get("last_updated")
        item["last_updated_str"] = lu.strftime("%Y-%m-%d") if lu else ""

    # Aggregates & Performance from utils
    stats = get_dashboard_stats(cursor)
    perf = get_performance_data(cursor)

    # Recent consumption logs
    cursor.execute("""
        SELECT ul.*, i.item_name, i.unit, ar.artist_name 
        FROM inventory_usage ul
        JOIN inventory i ON ul.item_id = i.item_id
        JOIN artist ar ON ul.artist_id = ar.artist_id
        ORDER BY ul.logged_at DESC LIMIT 20
    """)
    usage_logs = cursor.fetchall()

    # Public Inquiries
    cursor.execute("""
        SELECT i.*, ar.artist_name as requested_artist
        FROM inquiry i
        LEFT JOIN artist ar ON i.artist_id = ar.artist_id
        ORDER BY i.submitted_at DESC
    """)
    inquiries = cursor.fetchall()

    # Derived Stats
    low_stock_items = [
        i for i in inventory
        if (i.get("quant_stock") or 0) <= (i.get("reorder_level") or 0)
    ]
    
    total_revenue = sum(
        (p.get("amount_paid") or 0) for p in payments if p.get("status") == "Approved"
    )

    pending_revenue = sum(
        (i.get("total_amt") or 0)
        for i in invoices
        if i["pay_status"] in ("Pending", "Under Review")
    )

    return {
        "appointments": sanitize_for_json(appointments),
        "artists": sanitize_for_json(artists),
        "invoices": sanitize_for_json(invoices),
        "payments": sanitize_for_json(payments),
        "inventory": sanitize_for_json(inventory),
        "inquiries": sanitize_for_json(inquiries),
        "usage_logs": sanitize_for_json(usage_logs),
        "artist_performance": sanitize_for_json(perf["artist_performance"]),
        "payment_methods": sanitize_for_json(perf["payment_methods"]),
        "daily_revenue": sanitize_for_json(perf["daily_revenue"]),
        "concept_trends": sanitize_for_json(perf["concept_trends"]),
        "total_appointments": len(appointments),
        "pending_count": sum(1 for a in appointments if a["status"] == "Pending"),
        "approved_count": sum(1 for a in appointments if a["status"] == "Approved"),
        "done_count": sum(1 for a in appointments if a["status"] == "Done"),
        "rejected_count": sum(1 for a in appointments if a["status"] == "Rejected"),
        "cancelled_count": sum(1 for a in appointments if a["status"] == "Cancelled"),
        "total_artists": len(artists),
        "low_stock": len(low_stock_items),
        "low_stock_items": sanitize_for_json(low_stock_items),
        "unpaid_invoices": sum(1 for i in invoices if i["pay_status"] == "Pending"),
        "total_invoices": len(invoices),
        "total_revenue": total_revenue,
        "paid_revenue": total_revenue,
        "total_customers": stats["total_customers"],
        "pending_approvals": sum(1 for p in payments if p.get("status") == "Pending Approval"),
        "returning_customers": stats["returning_customers"],
        "monthly_revenue": sanitize_for_json(stats["monthly_revenue"]),
        "monthly_target": sanitize_for_json(stats["monthly_target"]),
        "pending_revenue": pending_revenue
    }
