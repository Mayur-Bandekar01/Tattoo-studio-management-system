# utils/db_maintenance.py
from ..db import get_db

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

        # 4. CRITICAL: Add artist_id to inventory for per-artist supply management
        cursor.execute("SHOW COLUMNS FROM inventory LIKE 'artist_id'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE inventory ADD COLUMN artist_id VARCHAR(50) DEFAULT NULL")
            cursor.execute("ALTER TABLE inventory ADD CONSTRAINT fk_inv_artist FOREIGN KEY (artist_id) REFERENCES artist(artist_id) ON DELETE CASCADE")
            conn.commit()

        # 5. Seed initial owner if table is empty
        cursor.execute("SELECT COUNT(*) as count FROM owner")
        if cursor.fetchone()['count'] == 0:
            cursor.execute(
                "INSERT INTO owner (owner_id, name, email, password) VALUES (%s, %s, %s, %s)",
                (1, 'Admin Owner', 'darkdragon.ink@gmail.com', 'mayu@123')
            )
            conn.commit()

        # 6. Performance Indexes
        index_checks = [
            ("customer", "idx_customer_email", "customer_email"),
            ("artist", "idx_artist_id", "artist_id"),
            ("owner", "idx_owner_email", "email")
        ]
        for table, index_name, column in index_checks:
            cursor.execute(f"SHOW INDEX FROM {table} WHERE Key_name = %s", (index_name,))
            if not cursor.fetchone():
                try:
                    cursor.execute(f"CREATE UNIQUE INDEX {index_name} ON {table}({column})")
                    conn.commit()
                except Exception:
                    pass

        # 7. Ensure gallery_likes table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS gallery_likes (
                like_id     INT AUTO_INCREMENT PRIMARY KEY,
                gallery_id  INT NOT NULL,
                customer_id INT NOT NULL,
                liked_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_gallery_like (gallery_id, customer_id),
                FOREIGN KEY (gallery_id)  REFERENCES gallery(gallery_id) ON DELETE CASCADE,
                FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)
        conn.commit()

    except Exception as e:
        print(f"Schema Maintenance Error: {e}")
    finally:
        pass
