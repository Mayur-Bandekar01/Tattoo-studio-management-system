import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "mayu@123"),
            database=os.getenv("DB_NAME", "dragon_tattoos")
        )
        cursor = conn.cursor()
        
        print("Adjusting 'artist_id' type and adding constraint...")
        try:
            cursor.execute("ALTER TABLE inquiry MODIFY COLUMN artist_id VARCHAR(20)")
        except:
            cursor.execute("ALTER TABLE inquiry ADD COLUMN artist_id VARCHAR(20) DEFAULT NULL")
            
        try:
            cursor.execute("ALTER TABLE inquiry ADD CONSTRAINT fk_inquiry_artist FOREIGN KEY (artist_id) REFERENCES artist(artist_id) ON DELETE SET NULL")
        except Exception as e:
            if "Duplicate key name" not in str(e):
                print(f"Constraint error: {e}")
        
        conn.commit()
        print("Migration completed!")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    migrate()
