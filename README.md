# Dragon Tattoos Studio Management System

A web-based management platform built with Python (Flask) and MySQL for tattoo studios. It centralizes appointment booking, artist portfolio management, material tracking, and studio billing.

## Key Features

- **Customer Portal**: Online booking for tattoo sessions, custom artwork/sketches, and laser removal, with appointment status tracking.
- **Artist Dashboard**: Personal appointment calendar, material/supply usage logging, and portfolio gallery management.
- **Studio Management (Owner)**: Revenue and performance analytics, staff management, supply inventory tracking with low-stock alerts, and invoice generation.
- **Billing & Invoicing**: Payment tracking, automated invoice generation, and status management (Pending, Paid, Partial).
- **Authentication & RBAC**: Role-based access control (Owner, Artist, Customer) with CSRF protection and pooled database connections.

## Tech Stack

- **Backend**: Python 3, Flask, Flask-WTF, Flask-Mail
- **Database**: MySQL (with connection pooling)
- **Frontend**: HTML5, Vanilla CSS, JavaScript, Jinja2 Templates

## Getting Started

### Prerequisites

- Python 3.10+
- MySQL Server 8.0+
- `pip` (Python package manager)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/dragon-tattoos-management.git
cd dragon-tattoos-management
```

### 2. Set Up Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Database Setup

1. Start your local MySQL server.
2. Import the schema and initial data from the `database/` directory:

```bash
mysql -u root -p < database/dragon.sql
```

### 5. Environment Configuration

Copy `.env.example` to `.env` and fill in your database credentials:

```bash
cp .env.example .env
```

Update your `.env` file with your settings:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dragon_tattoos
DB_POOL_SIZE=5

SECRET_KEY=your_secret_key_here
FLASK_DEBUG=1
PORT=5000

# Optional: Email / SMTP for OTP & notifications
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

### 6. Run the Application

```bash
python run.py
```

Open your browser and navigate to `http://localhost:5000`.

## Project Structure

```
├── backend/
│   ├── routes/          # Flask blueprints (public, auth, customer, artist, owner, chat)
│   ├── services/        # Business logic for artists and studio owner
│   ├── utils/           # Helpers (validators, mailer, metrics, schema maintenance)
│   ├── app.py           # App initialization and configuration
│   └── db.py            # MySQL connection pooling
├── database/
│   └── dragon.sql       # Database schema and seed data
├── frontend/
│   ├── static/          # CSS stylesheets, JS scripts, and upload directories
│   └── templates/       # Jinja2 template views by section
├── docs/
│   ├── api.md           # Route and endpoint reference
│   ├── architecture.md  # Architecture diagram and component breakdown
│   ├── database_schema.md # Database table reference
│   ├── er_diagram.md    # Mermaid ER diagram
│   └── project_synopsis.md # Project goals and module scope
├── .env.example         # Environment template
├── .gitignore           # Git ignore rules
├── LICENSE              # MIT License
├── requirements.txt     # Python package requirements
└── run.py               # Application entry point
```

## Documentation

Further details are available in the [`docs/`](./docs) directory:
- [API Reference](./docs/api.md)
- [Architecture Details](./docs/architecture.md)
- [Database Schema](./docs/database_schema.md)
- [ER Diagram](./docs/er_diagram.md)
- [Project Synopsis](./docs/project_synopsis.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
