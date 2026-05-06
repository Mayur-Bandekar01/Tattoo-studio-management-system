import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def add_phone_column():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "mayu@123"),
            database=os.getenv("DB_NAME", "dragon_tattoos")
        )
        cursor = conn.cursor()
        print("Adding 'phone' column to 'inquiry' table...")
        cursor.execute("ALTER TABLE inquiry ADD COLUMN phone VARCHAR(20) AFTER email")
        conn.commit()
        print("Success: 'phone' column added.")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_phone_column()
