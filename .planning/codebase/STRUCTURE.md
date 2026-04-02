# Project Structure

## Root
- `app.py`: Entry point, app configuration, blueprint registration.
- `db.py`: Database connection factory.
- `requirements.txt`: Python dependency list.
- `llms.txt`: Project overview for LLM context.

## Directories
- `/routes`: Blueprint definitions and route logic.
  - `auth.py`, `customer.py`, `artist.py`, `owner.py`, `public.py`, `chat.py`.
- `/templates`: Jinja2 templates organized by user role.
- `/static`: Assets and file-based data.
  - `/css`, `/js`, `/img`.
  - `/uploads`: Dynamically handled (gallery and reference images).
- `/utils`: Common utility functions.
  - `auth_decorators.py`: Login and role requirements.
  - `email_service.py`: Notification logic.
- `/docs`: Documentation (likely for setup and requirements).
- `/scripts`: Utility scripts (e.g., `sync_theme.py`).

## Analysis
The structure is well-organized by role, making it easy to isolate features for specific users (Artists, Customers, Owners).
