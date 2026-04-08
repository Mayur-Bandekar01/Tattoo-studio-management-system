# db.py
# Database utility to handle connections to MySQL.
from flask import g
import mysql.connector

def get_db():
    """Returns a clean connection to your MySQL database."""
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host     = "localhost",
            user     = "root",
            password = "mayu@123",
            database = "dragon_tattoos"
        )
    return g.db

