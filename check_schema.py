import mysql.connector

def get_db():
    return mysql.connector.connect(
        host="localhost", user="root", password="mayu@123", database="dragon_tattoos"
    )

conn = get_db()
cursor = conn.cursor()
for table in ['appointment', 'invoice', 'payment']:
    print(f"--- {table} ---")
    cursor.execute(f"DESCRIBE {table}")
    for row in cursor.fetchall():
        print(row)
conn.close()
