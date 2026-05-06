# Project Structure

## Root
- `backend/app.py`: Entry point, app configuration, blueprint registration.
- `backend/db.py`: Database connection factory.
- `backend/requirements.txt`: Python dependency list.
- `docs/llms.txt`: Project overview for LLM context.

## Directories
- `backend/routes/`: Blueprint definitions and route logic.
- `frontend/templates/`: Jinja2 templates organized by user role.
- `frontend/static/`: Assets and file-based data.
- `backend/utils/`: Common utility functions.
- `docs/`: Documentation.
- `backend/scripts/`: Utility scripts.

## Analysis
The structure is well-organized by role, making it easy to isolate features for specific users (Artists, Customers, Owners).
