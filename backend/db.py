import os
from flask import g
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def get_db():
    """Returns a clean connection to your MySQL database using environment variables."""
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host     = os.getenv("DB_HOST", "localhost"),
            user     = os.getenv("DB_USER", "root"),
            password = os.getenv("DB_PASSWORD", ""),
            database = os.getenv("DB_NAME", "dragon_tattoos")
        )
    return g.db
