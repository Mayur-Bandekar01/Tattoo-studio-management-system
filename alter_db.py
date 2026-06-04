import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv('e:/TatooStudioProject/backend/.env')

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", os.getenv("DB_PASS", "")),
    database=os.getenv("DB_NAME", "dragon_tattoos")
)

cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE appointment ADD COLUMN tattoo_name varchar(255) DEFAULT NULL AFTER service_type")
    print("Column added.")
except Exception as e:
    print("Error:", e)

conn.commit()
cursor.close()
conn.close()
