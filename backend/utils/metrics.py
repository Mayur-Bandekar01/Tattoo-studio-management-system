# backend/utils/metrics.py

def get_dashboard_stats(cursor):
    """Fetch aggregated statistics for the owner dashboard."""
    cursor.execute("SELECT COUNT(*) as c FROM customer")
    total_customers = cursor.fetchone()["c"]

    cursor.execute("""
        SELECT COUNT(*) as returning_count
        FROM (SELECT customer_id FROM appointment WHERE status = 'Done' GROUP BY customer_id HAVING COUNT(*) > 1) as sub
    """)
    returning_customers = cursor.fetchone()["returning_count"]

    cursor.execute("""
        SELECT IFNULL(SUM(amount_paid), 0) as monthly_val
        FROM payment
        WHERE status = 'Approved' 
          AND MONTH(payment_date) = MONTH(CURDATE())
          AND YEAR(payment_date) = YEAR(CURDATE())
    """)
    monthly_revenue = cursor.fetchone()["monthly_val"]

    cursor.execute("SELECT monthly_target FROM owner LIMIT 1")
    target_row = cursor.fetchone()
    monthly_target_goal = float(target_row["monthly_target"]) if target_row else 250000.0

    return {
        "total_customers": total_customers,
        "returning_customers": returning_customers,
        "monthly_revenue": monthly_revenue,
        "monthly_target": monthly_target_goal
    }


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
        "artist_performance": artist_performance,
        "payment_methods": payment_methods,
        "daily_revenue": daily_revenue,
        "concept_trends": concept_trends,
    }
