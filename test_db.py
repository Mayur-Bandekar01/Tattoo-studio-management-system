# test_db.py  ← new file, save this next to db.py
from db import get_db

try:
    conn = get_db()
    print("✅ Database connected successfully!")
    conn.close()
except Exception as e:
    print("❌ Connection failed:", e)
