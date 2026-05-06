# Architecture

## Model-Template-View (MTV)
The application follows a traditional Flask MTV pattern:
- **Models**: Handled via direct SQL queries in routes and utilities (no ORM like SQLAlchemy).
- **Templates**: Jinja2 templates in the `frontend/templates` directory.
- **Views/Controllers**: Route functions in the `backend/routes/` blueprints.

## Modularity
- **Blueprints**: Used for logical separation of features (auth, customer, artist, owner, chat).
- **Utilities**: Centralized logic for authentication (`decorators.py`) and database maintenance.
- **Database Access**: Centralized in `backend/db.py` via `get_db()`.

## Authentication & Authorization
- **Session-based**: Flask sessions (`permanent_session_lifetime` set in `app.py`).
- **Decorators**: Custom decorators used for role-based access control (RBAC).

## Communication Pattern
- **Dynamic Updates**: Some sections (like artist dashboard) use AJAX to load content dynamically into existing containers.
- **State Management**: Heavily reliant on server-side sessions and database state.
