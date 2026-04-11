# 🐉 Dragon Tattoos - Studio Management System

A premium, full-stack management portal designed for high-end tattoo studios. This system streamlines client bookings, artist scheduling, inventory tracking, and financial analytics within a unified, high-performance environment.

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd TatooStudioProject

# Install Python dependencies (Pinned versions)
pip install -r backend/requirements.txt

# Configure your environment
# Copy .env.example to .env and update credentials
# Production requires a secure SECRET_KEY

# Run the project from root
python run.py
```

## Features

- **Owner Dashboard**: Advanced analytics with two-tier filtering, revenue tracking, and artist performance metrics.
- **Artist Portal**: Individual appointment management, inventory usage logging, and gallery portfolio control.
- **Customer Hub**: Seamless booking experience for Tattoos, Art/Sketching, and Removal services with real-time status tracking.
- **Premium Aesthetics**: Framework-free Vanilla CSS3 architecture optimized for clarity, precision, and a luxury studio feel.
- **Financial Suite**: Consolidated invoicing and payment recording with automated billing states.
- **Security & Performance**: Global CSRF protection, secured session management, and MySQL connection pooling.

## Configuration

The application uses environment variables for all sensitive data and configuration. Create a `.env` file in the `backend/` directory.

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL Database Host | `localhost` |
| `DB_USER` | MySQL Database User | `root` |
| `DB_PASS` | MySQL Database Password | - |
| `DB_NAME` | Database Name | `dragon_tattoos` |
| `DB_POOL_SIZE`| Database Connection Pool Size | `5` |
| `SECRET_KEY` | Flask Secret Key (Required for Session & CSRF) | - |
| `MAIL_SERVER` | SMTP Server for OTP emails | `smtp.gmail.com` |
| `MAIL_USERNAME`| Email account for SMTP | - |
| `MAIL_PASSWORD`| Password/App Token for SMTP | - |

## Documentation

- [API Reference](./docs/api.md)
- [Architecture Details](./docs/architecture.md)
- [Project Plan](./docs/PLAN.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT
