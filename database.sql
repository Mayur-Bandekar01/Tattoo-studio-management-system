create database dragon_tattoos;
USE dragon_tattoos;

-- Step 1: No dependencies
CREATE TABLE IF NOT EXISTS customer (
    customer_id    INT PRIMARY KEY AUTO_INCREMENT,
    customer_name  VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    phone          VARCHAR(15)  NOT NULL,
    insta_id       VARCHAR(100)
);

-- Step 2: No dependencies
CREATE TABLE IF NOT EXISTS owner (
    owner_id  INT PRIMARY KEY AUTO_INCREMENT,
    name      VARCHAR(100) NOT NULL,
    email     VARCHAR(150) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    phone     VARCHAR(15)  NOT NULL
);

-- Step 3: No dependencies
CREATE TABLE IF NOT EXISTS artist (
    artist_id      INT PRIMARY KEY AUTO_INCREMENT,
    artist_name    VARCHAR(100) NOT NULL,
    artist_email   VARCHAR(150) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    phone          VARCHAR(15)  NOT NULL,
    specialisation VARCHAR(100) NOT NULL
);

-- Step 4: Needs customer + artist
CREATE TABLE IF NOT EXISTS appointment (
    appointment_id   INT PRIMARY KEY AUTO_INCREMENT,
    customer_id      INT NOT NULL,
    artist_id        INT NOT NULL,
    tattoo_concept   VARCHAR(200) NOT NULL,
    reference        VARCHAR(255),
    status           ENUM('Pending','Approved','Rejected','Done','Cancelled') DEFAULT 'Pending',
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_hours   INT,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (artist_id)   REFERENCES artist(artist_id)
);

-- Step 5: No dependencies
CREATE TABLE IF NOT EXISTS inventory (
    item_id       INT PRIMARY KEY AUTO_INCREMENT,
    item_name     VARCHAR(100) NOT NULL,
    category      ENUM('Needle','Ink','Glove','Aftercare','Other') NOT NULL,
    unit          VARCHAR(30)  NOT NULL,
    quant_stock   INT          NOT NULL DEFAULT 0,
    reorder_level INT          NOT NULL,
    unit_cost     DECIMAL(8,2) NOT NULL
);

-- Step 6: Needs appointment + inventory
CREATE TABLE IF NOT EXISTS inventory_usage (
    usage_id       INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT       NOT NULL,
    item_id        INT       NOT NULL,
    qty_used       INT       NOT NULL,
    logged_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id),
    FOREIGN KEY (item_id)        REFERENCES inventory(item_id)
);

-- Step 7: Needs appointment + owner
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id     INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT           NOT NULL UNIQUE,
    owner_id       INT           NOT NULL,
    total_amt      DECIMAL(10,2) NOT NULL,
    concept_type   ENUM('Tattoo','Touch-up','Removal','Sketch','Consultation') NOT NULL,
    pay_status     ENUM('Pending','Paid') DEFAULT 'Pending',
    generated_date DATE NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id),
    FOREIGN KEY (owner_id)       REFERENCES owner(owner_id)
);

-- Step 8: Needs invoice
CREATE TABLE IF NOT EXISTS payment (
    payment_id     INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id     INT           NOT NULL UNIQUE,
    amount_paid    DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash','UPI','Card','Other') NOT NULL,
    payment_date   DATE NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoice(invoice_id)
);
show tables;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'dragon_tattoos';


select * from inventory;





USE dragon_tattoos;
SELECT DISTINCT category FROM inventory;
-- Fix artist_id to VARCHAR
ALTER TABLE artist MODIFY artist_id VARCHAR(20);
ALTER TABLE appointment MODIFY artist_id VARCHAR(20);

-- Add missing columns to appointment
ALTER TABLE appointment ADD COLUMN service_type VARCHAR(20);
ALTER TABLE appointment ADD COLUMN extra_details JSON;



SET SQL_SAFE_UPDATES = 0;

UPDATE inventory SET category = 'Needle'    WHERE category = 'Needles';
UPDATE inventory SET category = 'Glove'     WHERE category = 'Safety';
UPDATE inventory SET category = 'Aftercare' WHERE category = 'Cleaning';
UPDATE inventory SET category = 'Other'     WHERE category = 'Art Supply';

SET SQL_SAFE_UPDATES = 1;

ALTER TABLE inventory MODIFY category ENUM('Needle','Ink','Glove','Aftercare','Canvas','Paper','Brush','Pigment','Other');



ALTER TABLE inventory ADD COLUMN artist_type VARCHAR(20) NOT NULL DEFAULT 'all';

ALTER TABLE invoice MODIFY pay_status ENUM('Pending','Paid','Under Review') DEFAULT 'Pending';

ALTER TABLE payment MODIFY payment_method TEXT NOT NULL;
ALTER TABLE payment ADD COLUMN status ENUM('Approved','Pending Approval') DEFAULT 'Approved';

CREATE TABLE IF NOT EXISTS gallery (
    gallery_id   INT PRIMARY KEY AUTO_INCREMENT,
    artist_id    VARCHAR(20)  NOT NULL,
    image_path   VARCHAR(255) NOT NULL,
    caption      VARCHAR(200),
    style        VARCHAR(100),
    uploaded_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artist(artist_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gallery_likes (
    like_id     INT PRIMARY KEY AUTO_INCREMENT,
    gallery_id  INT NOT NULL,
    customer_id INT NOT NULL,
    liked_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (gallery_id, customer_id),
    FOREIGN KEY (gallery_id)  REFERENCES gallery(gallery_id)   ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    message_id     INT PRIMARY KEY AUTO_INCREMENT,
    sender_id      VARCHAR(20)  NOT NULL,
    sender_role    ENUM('customer','artist') NOT NULL,
    receiver_id    VARCHAR(20)  NOT NULL,
    receiver_role  ENUM('customer','artist') NOT NULL,
    appointment_id INT,
    content        TEXT         NOT NULL,
    is_read        TINYINT(1)   DEFAULT 0,
    sent_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

select * from inventory;


SET SQL_SAFE_UPDATES = 0;

UPDATE inventory SET artist_type = 'tattoo' WHERE category IN ('Ink', 'Needle');
UPDATE inventory SET artist_type = 'all'    WHERE category IN ('Glove', 'Aftercare');
UPDATE inventory SET artist_type = 'art'    WHERE item_name IN ('Sketch Pencils', 'Watercolor Set', 'Canvas A4');

SET SQL_SAFE_UPDATES = 1;

SET SQL_SAFE_UPDATES = 0;

-- Tattoo-specific items
UPDATE inventory SET artist_type = 'tattoo' 
WHERE category IN ('Needle', 'Ink');

-- Art-specific items
UPDATE inventory SET artist_type = 'art' 
WHERE category IN ('Canvas', 'Paper', 'Brush', 'Pigment');

-- Shared items (visible to everyone)
UPDATE inventory SET artist_type = 'all' 
WHERE category IN ('Glove', 'Aftercare', 'Other');

SET SQL_SAFE_UPDATES = 1;




ALTER TABLE inventory 
ADD COLUMN artist_id VARCHAR(20) NOT NULL DEFAULT '' 
AFTER artist_type;

-- If you have existing items, assign them to their artist
-- UPDATE inventory SET artist_id = 'DRAG-ART-001' WHERE artist_id = '';

ALTER TABLE inventory 
ADD FOREIGN KEY (artist_id) REFERENCES artist(artist_id) ON DELETE CASCADE;

-- Step 1: Allow the column to be empty (NULL) instead of forcing a value
ALTER TABLE inventory MODIFY artist_id VARCHAR(20) NULL;

-- Step 2: Change the current blank strings into actual NULL values
SET SQL_SAFE_UPDATES = 0;
UPDATE inventory SET artist_id = NULL WHERE artist_id = '';
SET SQL_SAFE_UPDATES = 1;

-- Step 3: Add your Foreign Key constraint (MySQL will now accept it!)
ALTER TABLE inventory 
ADD FOREIGN KEY (artist_id) REFERENCES artist(artist_id) ON DELETE CASCADE;


-- Step 1: Allow the column to be empty (NULL) instead of forcing a value
ALTER TABLE inventory MODIFY artist_id VARCHAR(20) NULL;

-- Step 2: Change the current blank strings into actual NULL values
SET SQL_SAFE_UPDATES = 0;
UPDATE inventory SET artist_id = NULL WHERE artist_id = '';
SET SQL_SAFE_UPDATES = 1;

-- Step 3: Add your Foreign Key constraint (MySQL will now accept it!)
ALTER TABLE inventory 
ADD FOREIGN KEY (artist_id) REFERENCES artist(artist_id) ON DELETE CASCADE;


SET SQL_SAFE_UPDATES = 0;

-- Tattoo-specific items
UPDATE inventory SET artist_type = 'tattoo' 
WHERE category IN ('Needle', 'Ink');

-- Art-specific items
UPDATE inventory SET artist_type = 'art' 
WHERE category IN ('Canvas', 'Paper', 'Brush', 'Pigment');

-- Shared items (visible to everyone)
UPDATE inventory SET artist_type = 'all' 
WHERE category IN ('Glove', 'Aftercare', 'Other');

SET SQL_SAFE_UPDATES = 1;

ALTER TABLE inventory 
MODIFY quant_stock DECIMAL(8,2) NOT NULL DEFAULT 0;

ALTER TABLE inventory_usage 
MODIFY qty_used DECIMAL(8,2) NOT NULL;

describe inventory_usage;

ALTER TABLE inventory 
ADD COLUMN artist_id VARCHAR(20) NOT NULL DEFAULT '' 
AFTER artist_type;

-- If you have existing items, assign them to their artist
-- UPDATE inventory SET artist_id = 'DRAG-ART-001' WHERE artist_id = '';

ALTER TABLE inventory 
ADD FOREIGN KEY (artist_id) REFERENCES artist(artist_id) ON DELETE CASCADE;


SELECT item_id, item_name, artist_id FROM inventory;

UPDATE inventory SET artist_id = 'DRAG-ART-001' WHERE artist_id = '' OR artist_id IS NULL;

INSERT INTO inventory (item_name, category, unit, quant_stock, reorder_level, unit_cost, artist_type, artist_id)
VALUES 
('Sketch Pencils HB',      'Other',    'Pieces',  20, 5,  10,  'art', 'DRAG-ART-002'),
('Sketch Pencils 2B',      'Other',    'Pieces',  20, 5,  10,  'art', 'DRAG-ART-002'),
('Sketch Pencils 4B',      'Other',    'Pieces',  20, 5,  10,  'art', 'DRAG-ART-002'),
('Charcoal Sticks',        'Other',    'Pieces',  15, 4,  15,  'art', 'DRAG-ART-002'),
('Ink Pens 0.1mm',         'Other',    'Pieces',  10, 3,  25,  'art', 'DRAG-ART-002'),
('Ink Pens 0.3mm',         'Other',    'Pieces',  10, 3,  25,  'art', 'DRAG-ART-002'),
('Watercolor Set 12 colors','Pigment', 'Sets',     5, 2,  200, 'art', 'DRAG-ART-002'),
('Acrylic Paint Set',      'Pigment',  'Sets',     3, 1,  350, 'art', 'DRAG-ART-002'),
('Canvas A4',              'Canvas',   'Sheets',  30, 10, 15,  'art', 'DRAG-ART-002'),
('Canvas A3',              'Canvas',   'Sheets',  20, 8,  25,  'art', 'DRAG-ART-002'),
('Watercolor Paper A4',    'Paper',    'Sheets',  50, 15, 8,   'art', 'DRAG-ART-002'),
('Sketch Paper A3',        'Paper',    'Sheets',  40, 10, 5,   'art', 'DRAG-ART-002'),
('Round Brushes Set',      'Brush',    'Sets',     5, 2,  150, 'art', 'DRAG-ART-002'),
('Flat Brushes Set',       'Brush',    'Sets',     5, 2,  150, 'art', 'DRAG-ART-002'),
('Eraser Set',             'Other',    'Packs',   10, 3,  20,  'art', 'DRAG-ART-002'),
('Palette Mixing Tray',    'Other',    'Pieces',   3, 1,  80,  'art', 'DRAG-ART-002'),
('Nitrile Gloves',         'Glove',    'Pairs',   50, 10, 3,   'art', 'DRAG-ART-002'),
('Sanitizer',              'Aftercare','Bottles',  3, 1,  80,  'art', 'DRAG-ART-002');



