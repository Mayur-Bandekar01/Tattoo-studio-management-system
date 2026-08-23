# Database Schema

The database for Dragon Tattoos Studio Management System runs on **MySQL** (`dragon_tattoos`). The full database initialization script is located in [`database/dragon.sql`](../database/dragon.sql).

## Tables Overview

### 1. `user`
Stores core user login accounts and access roles.
- `user_id` (INT, Primary Key, Auto Increment)
- `username` (VARCHAR(50), Unique)
- `email` (VARCHAR(100), Unique)
- `password_hash` (VARCHAR(255))
- `role` (VARCHAR(20)) - `owner`, `artist`, `customer`
- `artist_id` (VARCHAR(20), Foreign Key -> `artist.artist_id`, Nullable)
- `created_at` (TIMESTAMP)

### 2. `artist`
Stores artist profiles, portfolio information, and contact details.
- `artist_id` (VARCHAR(20), Primary Key) - e.g., `DRAG-ART-001`
- `artist_name` (VARCHAR(100))
- `specialisation` (VARCHAR(100))
- `phone` (VARCHAR(20))
- `email` (VARCHAR(100))
- `experience` (INT)
- `bio` (TEXT)
- `profile_photo` (VARCHAR(255))
- `created_at` (TIMESTAMP)

### 3. `customer`
Stores customer profile records and medical disclosures.
- `customer_id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR(100))
- `email` (VARCHAR(100), Unique)
- `phone` (VARCHAR(20))
- `medical_conditions` (TEXT)
- `created_at` (TIMESTAMP)

### 4. `appointment`
Manages client bookings, assigned artists, service types, and appointment scheduling.
- `appointment_id` (INT, Primary Key, Auto Increment)
- `customer_id` (INT, Foreign Key -> `customer.customer_id`)
- `artist_id` (VARCHAR(20), Foreign Key -> `artist.artist_id`)
- `service_type` (VARCHAR(20)) - `tattoo`, `sketch`, `removal`
- `tattoo_name` (VARCHAR(255))
- `tattoo_concept` (VARCHAR(255))
- `reference` (VARCHAR(255)) - File path or JSON metadata
- `extra_details` (TEXT)
- `appointment_date` (DATE)
- `appointment_time` (TIME)
- `duration_hours` (DECIMAL(4,1))
- `status` (VARCHAR(20)) - `Pending`, `Confirmed`, `Done`, `Cancelled`, `Rejected`
- `created_at` (TIMESTAMP)

### 5. `gallery`
Stores artist portfolio artwork showcase items.
- `gallery_id` (INT, Primary Key, Auto Increment)
- `artist_id` (VARCHAR(20), Foreign Key -> `artist.artist_id`)
- `image_path` (VARCHAR(255))
- `title` (VARCHAR(100))
- `style` (VARCHAR(50))
- `uploaded_at` (TIMESTAMP)

### 6. `inquiry`
Stores public inquiries and consultation requests.
- `inquiry_id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR(100))
- `email` (VARCHAR(100))
- `phone` (VARCHAR(20))
- `artist_id` (VARCHAR(20), Foreign Key -> `artist.artist_id`, Nullable)
- `service_type` (VARCHAR(50))
- `description` (TEXT)
- `reference_image` (VARCHAR(255))
- `status` (VARCHAR(20)) - `New`, `Reviewed`, `Archived`
- `created_at` (TIMESTAMP)

### 7. `inventory`
Tracks tattoo inks, needles, supplies, and low-stock alerts.
- `item_id` (INT, Primary Key, Auto Increment)
- `item_name` (VARCHAR(100))
- `category` (VARCHAR(50))
- `current_stock` (INT)
- `min_threshold` (INT)
- `unit` (VARCHAR(20))
- `unit_cost` (DECIMAL(10,2))
- `last_updated` (TIMESTAMP)

### 8. `inventory_usage`
Tracks material consumption logged by artists.
- `usage_id` (INT, Primary Key, Auto Increment)
- `item_id` (INT, Foreign Key -> `inventory.item_id`)
- `artist_id` (VARCHAR(20), Foreign Key -> `artist.artist_id`)
- `quantity_used` (INT)
- `usage_date` (DATE)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

### 9. `invoice`
Stores billing records linked to appointments.
- `invoice_id` (VARCHAR(20), Primary Key)
- `appointment_id` (INT, Foreign Key -> `appointment.appointment_id`)
- `total_amount` (DECIMAL(10,2))
- `discount` (DECIMAL(10,2))
- `final_amount` (DECIMAL(10,2))
- `payment_status` (VARCHAR(20)) - `Pending`, `Paid`, `Partial`
- `payment_method` (VARCHAR(50))
- `created_at` (TIMESTAMP)

### 10. `payment`
Records transaction logs and installment payments against invoices.
- `payment_id` (INT, Primary Key, Auto Increment)
- `invoice_id` (VARCHAR(20), Foreign Key -> `invoice.invoice_id`)
- `amount_paid` (DECIMAL(10,2))
- `payment_date` (DATE)
- `payment_method` (VARCHAR(50))
- `transaction_ref` (VARCHAR(100))
- `notes` (TEXT)

### 11. `message`
In-app communication between studio roles.
- `message_id` (INT, Primary Key, Auto Increment)
- `sender_id` (INT)
- `sender_role` (VARCHAR(20))
- `receiver_id` (INT)
- `receiver_role` (VARCHAR(20))
- `message` (TEXT)
- `is_read` (BOOLEAN)
- `created_at` (TIMESTAMP)

### 12. `review`
Client reviews and ratings for completed appointments.
- `review_id` (INT, Primary Key, Auto Increment)
- `appointment_id` (INT, Foreign Key -> `appointment.appointment_id`)
- `customer_id` (INT, Foreign Key -> `customer.customer_id`)
- `artist_id` (VARCHAR(20), Foreign Key -> `artist.artist_id`)
- `rating` (INT)
- `review_text` (TEXT)
- `created_at` (TIMESTAMP)
