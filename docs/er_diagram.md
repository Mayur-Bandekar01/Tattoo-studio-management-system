# ER Diagram — Dragon Tattoos Studio Management System
## Chen Notation (Mermaid `erDiagram`)

> **Chen Notation Key:**
> - `||--o{` = one-to-many
> - `||--||` = one-to-one
> - `PK` = Primary Key · `FK` = Foreign Key

```mermaid
erDiagram

    OWNER {
        int     owner_id        PK
        string  name
        string  email
        string  password
        string  phone
        decimal monthly_target
        datetime created_at
    }

    CUSTOMER {
        int     customer_id     PK
        string  customer_name
        string  customer_email
        string  password
        string  phone
        string  insta_id
        datetime created_at
    }

    ARTIST {
        string  artist_id       PK
        string  artist_name
        string  artist_email
        string  password
        string  phone
        string  specialisation
        string  profile_image
        datetime created_at
    }

    APPOINTMENT {
        int     appointment_id  PK
        int     customer_id     FK
        string  artist_id       FK
        string  service_type
        string  tattoo_concept
        string  reference
        string  extra_details
        date    appointment_date
        time    appointment_time
        decimal duration_hours
        string  status
        datetime created_at
    }

    GALLERY {
        int     gallery_id      PK
        string  artist_id       FK
        string  image_path
        string  caption
        string  style
        datetime uploaded_at
    }

    INQUIRY {
        int     inquiry_id      PK
        string  full_name
        string  email
        string  phone
        string  inquiry_type
        string  message
        string  status
        datetime submitted_at
        string  artist_id       FK
    }

    INVENTORY {
        int     item_id         PK
        string  item_name
        string  category
        string  unit
        decimal quant_stock
        decimal reorder_level
        decimal unit_cost
        string  artist_type
        string  artist_id       FK
        datetime updated_at
    }

    INVENTORY_USAGE {
        int     usage_id        PK
        int     appointment_id  FK
        int     item_id         FK
        string  artist_id       FK
        decimal qty_used
        datetime logged_at
    }

    INVOICE {
        int     invoice_id      PK
        int     appointment_id  FK
        int     owner_id        FK
        decimal total_amt
        string  concept_type
        string  pay_status
        date    generated_date
    }

    PAYMENT {
        int     payment_id      PK
        int     invoice_id      FK
        decimal amount_paid
        string  payment_method
        date    payment_date
        string  status
    }

    MESSAGES {
        int     message_id      PK
        string  sender_id
        string  sender_role
        string  receiver_id
        string  receiver_role
        int     appointment_id  FK
        string  content
        datetime sent_at
        int     is_read
    }

    OWNER ||--o{ INVOICE : "generates"
    CUSTOMER ||--o{ APPOINTMENT : "books"
    ARTIST ||--o{ APPOINTMENT : "handles"
    APPOINTMENT ||--|| INVOICE : "generates"
    INVOICE ||--o{ PAYMENT : "settled by"
    ARTIST ||--o{ GALLERY : "uploads"
    ARTIST ||--o{ INQUIRY : "assigned"
    ARTIST ||--o{ INVENTORY : "manages"
    APPOINTMENT ||--o{ INVENTORY_USAGE : "uses"
    INVENTORY ||--o{ INVENTORY_USAGE : "tracked in"
    ARTIST ||--o{ INVENTORY_USAGE : "logs"
    APPOINTMENT ||--o{ MESSAGES : "contextualises"
```

---

## Entity Summary Table

| Entity            | PK               | Description                              |
|------------------|------------------|------------------------------------------|
| `OWNER`           | `owner_id`       | Studio owner / admin                     |
| `CUSTOMER`        | `customer_id`    | Registered clients                       |
| `ARTIST`          | `artist_id`      | Staff artists (e.g. `DRAG-ART-001`)      |
| `APPOINTMENT`     | `appointment_id` | Service booking record                   |
| `GALLERY`         | `gallery_id`     | Artist portfolio images                  |
| `INQUIRY`         | `inquiry_id`     | Pre-booking customer inquiries           |
| `INVENTORY`       | `item_id`        | Supply / material stock items            |
| `INVENTORY_USAGE` | `usage_id`       | Bridge: Appointment ↔ Inventory (N:M)   |
| `INVOICE`         | `invoice_id`     | Financial billing per appointment        |
| `PAYMENT`         | `payment_id`     | Payment transaction per invoice          |
| `MESSAGES`        | `message_id`     | Chat between Customer ↔ Artist           |

---

## Relationship Summary (Chen Cardinality)

| Relationship                        | Cardinality | Participation         |
|-------------------------------------|-------------|----------------------|
| OWNER → INVOICE                     | 1 : N       | Total / Partial       |
| CUSTOMER → APPOINTMENT              | 1 : N       | Total / Partial       |
| ARTIST → APPOINTMENT                | 1 : N       | Partial / Partial     |
| APPOINTMENT → INVOICE               | 1 : 1       | Total / Partial       |
| INVOICE → PAYMENT                   | 1 : N       | Total / Partial       |
| ARTIST → GALLERY                    | 1 : N       | Total / Partial       |
| ARTIST → INQUIRY (assigned)         | 1 : N       | Partial / Partial     |
| ARTIST → INVENTORY                  | 1 : N       | Partial / Partial     |
| APPOINTMENT × INVENTORY (via Usage) | N : M       | Partial / Partial     |
| ARTIST → INVENTORY_USAGE            | 1 : N       | Total / Partial       |
| APPOINTMENT → MESSAGES              | 1 : N       | Partial / Partial     |
