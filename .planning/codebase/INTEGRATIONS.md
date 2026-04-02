# Integrations

## External Services
- **SMTP Service**: Gmail (`smtp.gmail.com`) used via `Flask-Mail`.
  - Credentials and settings found in `app.py`.
  - Used for booking confirmations and notifications.

## Internal Integrations
- **File System**:
  - `static/uploads/gallery`: Artist portfolio storage.
  - `static/uploads/references`: Customer reference images for bookings.
- **Database**: local MySQL instance (`dragon_tattoos`).

## Configuration
- **Environment Variables**: Loaded from `.env` (not committed, but referenced in `app.py`).
