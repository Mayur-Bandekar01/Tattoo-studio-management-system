# utils/db_maintenance.py
from ..db import get_db


def ensure_schema_consistency():
    """Perform basic schema checks and data seeding with isolated blocks to prevent cascade failures."""
    try:
        conn = get_db()
    except Exception as e:
        # Maintenance connection error
        return

    with conn.cursor(dictionary=True) as cursor:
        # Helper to run isolated steps
        def run_step(name, sql, params=None, commit=True):
            try:
                if params:
                    cursor.execute(sql, params)
                else:
                    cursor.execute(sql)
                if commit:
                    conn.commit()
                return True
            except Exception as e:
                return False

        # 1. Profile Image
        cursor.execute("SHOW COLUMNS FROM artist LIKE 'profile_image'")
        if not cursor.fetchone():
            run_step("Add profile_image", "ALTER TABLE artist ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL")

        # 2. Seed Artists
        cursor.execute("SELECT COUNT(*) as count FROM artist")
        if cursor.fetchone()["count"] == 0:
            artists_to_seed = [
                ("DRAG-ART-001", "Arjun Mehta", "arjun@dragon.ink", "9999999901", "Tattoo Artist", "pass123", "images/artist1.jpg"),
                ("DRAG-ART-002", "Priya Sharma", "priya@dragon.ink", "9999999902", "Sketch Artist", "pass123", "images/artist2.jpg"),
                ("DRAG-ART-003", "Rahul Verma", "rahul@dragon.ink", "9999999903", "Laser Removal Specialist", "pass123", "images/artist3.jpg"),
            ]
            try:
                cursor.executemany("INSERT INTO artist (artist_id, artist_name, artist_email, phone, specialisation, password, profile_image) VALUES (%s, %s, %s, %s, %s, %s, %s)", artists_to_seed)
                conn.commit()
            except Exception as e:
                pass

        # 3. Last Updated Inventory
        cursor.execute("SHOW COLUMNS FROM inventory LIKE 'last_updated'")
        if not cursor.fetchone():
            run_step("Add inventory last_updated", "ALTER TABLE inventory ADD COLUMN last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")

        # 4. Inventory Artist ID
        cursor.execute("SHOW COLUMNS FROM inventory LIKE 'artist_id'")
        if not cursor.fetchone():
            if run_step("Add inventory artist_id", "ALTER TABLE inventory ADD COLUMN artist_id VARCHAR(50) DEFAULT NULL"):
                run_step("Add inventory artist FK", "ALTER TABLE inventory ADD CONSTRAINT fk_inv_artist FOREIGN KEY (artist_id) REFERENCES artist(artist_id) ON DELETE CASCADE")

        # 5. Ensure owner table exists
        run_step("Create owner table", """
            CREATE TABLE IF NOT EXISTS owner (
                owner_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(15) DEFAULT NULL,
                monthly_target DECIMAL(10,2) DEFAULT 250000.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        # Sync monthly_target column if table already exists
        cursor.execute("SHOW COLUMNS FROM owner LIKE 'monthly_target'")
        if not cursor.fetchone():
            run_step("Add owner monthly_target", "ALTER TABLE owner ADD COLUMN monthly_target DECIMAL(10,2) DEFAULT 250000.00")

        # 6. Seed Owner
        cursor.execute("SELECT COUNT(*) as count FROM owner")
        if cursor.fetchone()["count"] == 0:
            run_step("Seed Owner", "INSERT INTO owner (name, email, password) VALUES (%s, %s, %s)", ("Dragon Owner", "owner@dragon.com", "Owner@123"))

        # 7. Gallery Likes
        run_step("Create gallery_likes", """
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

        # 8. Expand Inventory Columns (Support 'Blood Art' and prevent truncation)
        # We use VARCHAR instead of ENUM for maximum flexibility as requested by user's previous truncation issues
        run_step("Expand inventory columns", "ALTER TABLE inventory MODIFY COLUMN category VARCHAR(100), MODIFY COLUMN unit VARCHAR(50)")

        # 9. Seed Syringe Tool
        cursor.execute("SELECT COUNT(*) as count FROM inventory WHERE item_name = %s AND artist_id = %s", ('Syringe (Blood Extraction Tool)', 'DRAG-ART-002'))
        if cursor.fetchone()["count"] == 0:
            run_step("Seed Syringe", """
                INSERT INTO inventory (item_name, category, unit, quant_stock, reorder_level, unit_cost, artist_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, ('Syringe (Blood Extraction Tool)', 'Blood Art', 'Pieces', 50, 10, 120.00, 'DRAG-ART-002'))

        # 9. IMPORTANT: inventory_usage
        run_step("Create inventory_usage", """
            CREATE TABLE IF NOT EXISTS inventory_usage (
                usage_id       INT AUTO_INCREMENT PRIMARY KEY,
                appointment_id  INT NOT NULL,
                item_id         INT NOT NULL,
                qty_used        DECIMAL(10,2) NOT NULL,
                artist_id       VARCHAR(50) NOT NULL,
                logged_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE CASCADE,
                FOREIGN KEY (item_id)        REFERENCES inventory(item_id) ON DELETE CASCADE,
                FOREIGN KEY (artist_id)       REFERENCES artist(artist_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        # 10. Force Artist Assignment for Sanitizer and Nitrile Gloves (User Request)
        try:
            cursor.execute("""
                UPDATE inventory 
                SET artist_id = 'DRAG-ART-001' 
                WHERE item_name LIKE '%Sanitizer%' OR item_name LIKE '%Nitrile Gloves%'
            """)
            conn.commit()
        except Exception as e:
            pass
