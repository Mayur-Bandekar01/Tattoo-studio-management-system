import os
import sys
from backend.db import db_pool

def check_schema():
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SHOW COLUMNS FROM inquiry")
    columns = cursor.fetchall()
    for col in columns:
        print(col)
    conn.close()

if __name__ == "__main__":
    check_schema()
