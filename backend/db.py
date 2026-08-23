import os
import mysql.connector.pooling
from flask import g
from dotenv import load_dotenv

load_dotenv()

# Initialize MySQL connection pool
db_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="dragon_pool",
    pool_size=int(os.getenv("DB_POOL_SIZE", 5)),
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", 3306)),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", os.getenv("DB_PASS", "")),
    database=os.getenv("DB_NAME", "dragon_tattoos"),
    charset="utf8mb4",
    collation="utf8mb4_general_ci",
    use_pure=True,
)


def get_db():
    """Returns a pooled connection from the MySQL pool."""
    if "db" not in g:
        # Request a connection from the pre-warmed pool
        conn = db_pool.get_connection()
        # Ensure the connection is alive
        conn.ping(reconnect=True, attempts=3, delay=1)
        g.db = conn
    return g.db


def close_db(e=None):
    """Closes the database connection for the current request context."""
    db = g.pop("db", None)
    if db is not None:
        try:
            db.close()
        except Exception:
            pass
