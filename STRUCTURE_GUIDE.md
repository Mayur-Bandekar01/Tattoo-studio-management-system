# Project Structure Guide

The project has been reorganized to clearly separate Frontend and Backend components.

## New Structure Overview

- **`backend/`**: Server-side logic, database, and API.
  - `routes/`: Blueprint definitions.
  - `utils/`: Utility functions.
  - `app.py`: Main Flask application.
  - `db.py`: Database connection logic.
  - `database.sql`: SQL Schema.
  - `requirements.txt`: Python dependencies.
- **`frontend/`**: Client-side UI and assets.
  - `static/`: CSS, JS, Images, and user uploads.
  - `templates/`: HTML templates.
- **Root**:
  - `run.py`: The new entry point to start the application.
  - `finalize_restructure.bat`: Run this once to clean up the root folder.
  - `README.md`: General project information.

## How to Run
Instead of running `python app.py`, you should now run:
```bash
python run.py
```
This is a small wrapper that starts the app from the new `backend` directory.

## Maintenance
If you add new routes, place them in `backend/routes/`.
If you add new styles or templates, place them in `frontend/static/` or `frontend/templates/`.
