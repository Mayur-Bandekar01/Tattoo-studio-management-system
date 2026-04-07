from flask import g
import mysql.connector

def get_db():
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host     = "localhost",
            user     = "root",
            password = "mayu@123",
            database = "dragon_tattoos"
        )
    return g.db

