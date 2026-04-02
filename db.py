import mysql.connector

def get_db():
    conn = mysql.connector.connect(
        host     = "localhost",
        user     = "root",
        password = "mayu@123",
        database = "dragon_tattoos"
    )
    return conn

