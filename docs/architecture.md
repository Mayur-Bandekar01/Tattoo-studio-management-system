# Architecture Overview

This document describes the architectural layout and component structure of the Dragon Tattoos Studio Management System.

## Architecture

```
                               ┌─────────────────────────┐
                               │   Client Web Browser    │
                               └───────────┬─────────────┘
                                           │ HTTP / Jinja2 SSR
                                           ▼
                               ┌─────────────────────────┐
                               │    Flask Application    │
                               │      (backend/app.py)   │
                               └─────┬──────────────┬────┘
                                     │              │
                    ┌────────────────┴───┐      ┌───┴────────────────┐
                    │  Blueprint Routes  │      │ Utility & Services │
                    │  (backend/routes/) │      │ (backend/services/)│
                    └────────┬───────────┘      └───┬────────────────┘
                             │                      │
                             └───────────┬──────────┘
                                         ▼
                               ┌─────────────────────────┐
                               │  Database Pool (MySQL)  │
                               │      (backend/db.py)    │
                               └─────────────────────────┘
```

### 1. Backend (`backend/`)
- **`app.py`**: Central Flask application setup, environment loading, error handlers, and blueprint registration.
- **`db.py`**: Connection pool initialization and context lifecycle handlers (`get_db`, `close_db`).
- **`routes/`**: Modular Flask blueprints divided by role and function:
  - `public.py`: Public website views (Home, About, Services, Gallery, Contact).
  - `auth.py`: User registration, login, logout, and password recovery.
  - `customer.py`: Customer portal for booking sessions, viewing history, and invoices.
  - `artist.py`: Artist appointment management, portfolio updates, and material usage logs.
  - `owner.py`: Studio owner oversight, revenue analytics, inquiries, and staff control.
  - `chat.py`: Direct messaging between studio staff and clients.
- **`services/`**: Business logic helpers for artist and owner operations.
- **`utils/`**: Helper utilities including input validators, serializers, email dispatching, and schema verification.

### 2. Frontend (`frontend/`)
- **`templates/`**: Jinja2 templates organized by section (`landing/`, `customer/`, `artist/`, `owner/`, `auth/`, `billing/`).
- **`static/`**:
  - `css/`: Modular stylesheets tailored for each dashboard role.
  - `js/`: Vanilla JavaScript for UI interactions, appointment modals, and asynchronous actions.
  - `uploads/`: Dedicated directories for user uploads (`gallery/`, `references/`).

### 3. Database Layer (`database/`)
- Relational schema managed via MySQL.
- Connection pooling handles concurrent connections efficiently.
- Foreign key constraints enforce relationship integrity across appointments, users, and billing logs.
