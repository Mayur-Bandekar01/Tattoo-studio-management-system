import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def check_schema():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "mayu@123"),
            database=os.getenv("DB_NAME", "dragon_tattoos")
        )
        cursor = conn.cursor()
        cursor.execute("DESCRIBE inquiry")
        columns = cursor.fetchall()
        print("Columns in 'inquiry' table:")
        for col in columns:
            print(col)
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
