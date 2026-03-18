from db import get_db

try:
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()

    print("✅ Connected successfully!")
    for t in tables:
        print("  →", t[0])

    conn.close()

except Exception as e:
    print("❌ Failed:", e)
