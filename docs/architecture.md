# Project Architecture Analysis: Dragon Tattoos

## Overview
This project is a **Flask-based Web Application** designed for a tattoo studio. It uses a monolithic architecture with server-side rendering (Jinja2) and a relational database (MySQL/MariaDB).

## Core Architecture

### 1. Backend (Logic & Routing)
- **`app.py`**: The central entry point. Contains all route definitions (Landing, Auth, Dashboards) and business logic.
- **`db.py`**: Handles database connection pooling using `mysql.connector`.

### 2. Frontend (UI/UX)
- **Engine**: Jinja2 Templating.
- **Styling**: Tailwind CSS (CDN-based) with a dark/light theme system integrated directly into the templates.
- **Structure**:
    - `templates/landing/`: Public marketing pages.
    - `templates/artist/`, `templates/customer/`, `templates/owner/`: Role-based protected dashboards.
    - `static/js/theme.js`: Client-side theme switching logic.
    - `static/images/logo.jpg`: Brand assets.

### 3. Database Schema (Inferred)
- **Tables**: `customer`, `artist`, `owner`, `appointment`, `inventory`, `invoice`, `payment`.
- **Relationships**: Appointments link customers and artists; Invoices link to appointments.

---

## File Structure Report

| Component | Path | Description |
| :--- | :--- | :--- |
| **Logic** | `app.py`, `db.py` | Flask app and DB connection. |
| **Templates** | `templates/` | Role-based HTML templates. |
| **Static** | `static/` | JS, Images, and assets. |
| **Utilities** | `lint_html.py`, `test.py` | Basic connection check and HTML linter. |

---

## Redundant / Useless Files Identified

The following files are identified as "one-off" scripts or temporary patches that are no longer needed as their changes have been integrated into the core codebase:

1.  **Patches/Fixes**:
    - `fix_l813.py`: Fixed a specific syntax error in templates.
    - `fix_visibility.py`: Likely an old visibility patch.
    - `patch_dashboard_text.py`: Replaced Tailwind classes with variables.
    - `patch_light_mode.py`: Integrated light mode CSS.
    - `patch_orange_light.py`: Theme adjustment.
    - `patch_pure_black.py`: Theme adjustment.
2.  **Wrappers/Temp**:
    - `run_wrapper.py`: Temporary script for running sub-agents/design tools.
    - `tmp_checker.py`: Likely a temporary state check.
    - `fix_visibility.py`: Redundant.
3.  **Standard Exclusions**:
    - `__pycache__`: Python byte-code cache.

## Recommendations
- **Consolidate Scripts**: Move useful utilities (`test.py`, `lint_html.py`) into a `/scripts` directory.
- **Delete Redundant Patches**: Remove all `fix_*.py` and `patch_*.py` files to clean the root directory.
- **Environment Variables**: Move the hardcoded DB password in `db.py` to a `.env` file.
