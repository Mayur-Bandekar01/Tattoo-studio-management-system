# utils/db_maintenance.py
from db import get_db

def ensure_schema_consistency():
    """Perform basic schema checks and data seeding if necessary."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Ensure profile_image column exists in artist table
        cursor.execute("SHOW COLUMNS FROM artist LIKE 'profile_image'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE artist ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL")
            conn.commit()

        # 2. Seed initial artists if table is empty
        cursor.execute("SELECT COUNT(*) as count FROM artist")
        if cursor.fetchone()['count'] == 0:
            artists_to_seed = [
                ('DRAG-ART-001', 'Arjun Mehta', 'arjun@dragon.ink', '9999999901', 'Tattoo Artist', 'pass123', 'images/artist1.jpg'),
                ('DRAG-ART-002', 'Priya Sharma', 'priya@dragon.ink', '9999999902', 'Sketch Artist', 'pass123', 'images/artist2.jpg'),
                ('DRAG-ART-003', 'Rahul Verma',   'rahul@dragon.ink',   '9999999903', 'Laser Removal Specialist', 'pass123', 'images/artist3.jpg')
            ]
            cursor.executemany(
                "INSERT INTO artist (artist_id, artist_name, artist_email, phone, specialisation, password, profile_image) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                artists_to_seed
            )
            conn.commit()
            
        # 3. Ensure last_updated exists in inventory (from previous migration)
        cursor.execute("SHOW COLUMNS FROM inventory LIKE 'last_updated'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE inventory ADD COLUMN last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
            conn.commit()
            
    except Exception as e:
        print(f"Schema Maintenance Error: {e}")
    finally:
        conn.close()
