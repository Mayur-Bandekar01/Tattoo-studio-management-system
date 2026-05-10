from ..utils.serializers import sanitize_for_json
from datetime import date

def get_artist_dashboard_data(cursor, artist_id):
    """
    Aggregates all necessary data for the artist dashboard.
    Centralizes queries to avoid route bloat.
    """
    # 1. Appointments
    cursor.execute(
        """
        SELECT a.*, c.customer_name FROM appointment a
        JOIN customer c ON a.customer_id = c.customer_id
        WHERE a.artist_id = %s ORDER BY a.appointment_date ASC
    """,
        (artist_id,),
    )
    appointments = cursor.fetchall()
    appointments = sanitize_for_json(appointments)

    # 2. Inventory (Artist-specific)
    cursor.execute(
        "SELECT * FROM inventory WHERE artist_id = %s ORDER BY category, item_name",
        (artist_id,),
    )
    inventory = cursor.fetchall()
    inventory = sanitize_for_json(inventory)

    # 3. Gallery
    cursor.execute(
        "SELECT * FROM gallery WHERE artist_id = %s ORDER BY uploaded_at DESC",
        (artist_id,),
    )
    gallery = cursor.fetchall()
    gallery = sanitize_for_json(gallery)

    # 4. Profile
    cursor.execute("SELECT * FROM artist WHERE artist_id = %s", (artist_id,))
    artist_profile = cursor.fetchone()
    artist_profile = sanitize_for_json(artist_profile)

    # 5. Usage Logs
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

    # 6. Inquiries (Assigned to this artist OR unassigned)
    cursor.execute("""
        SELECT i.*, ar.artist_name as requested_artist
        FROM inquiry i
        LEFT JOIN artist ar ON i.artist_id = ar.artist_id
        WHERE i.artist_id = %s OR i.artist_id IS NULL
        ORDER BY i.submitted_at DESC
    """, (artist_id,))
    inquiries = cursor.fetchall()
    inquiries = sanitize_for_json(inquiries)

    # 7. Compute Stats
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

    return {
        "artist_profile": artist_profile,
        "appointments": appointments,
        "inventory": inventory,
        "inquiries": inquiries,
        "usage_logs": usage_logs,
        "my_gallery": gallery,
        "total_count": total_count,
        "pending_count": pending_count,
        "done_count": done_count,
        "low_stock": low_stock,
        "today_count": today_count
    }
