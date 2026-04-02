# Conventions

## Python / Flask
- **Routing**: Use Blueprints for all features.
- **Dependency**: `from db import get_db` for SQL access.
- **Database**: 
  - Use `cursor = conn.cursor(dictionary=True)` for readable results.
  - Close connections explicitly: `conn.close()`.
- **Security**: 
  - Mandatory role checks at the start of every route: `if session.get('role') != 'role_name':`.
  - Use `secure_filename` for all uploads.
- **Style**:
  - Snake_case for functions and variables.
  - 4-space indentation (with occasional block alignment for readability in config).

## Frontend / Templates
- **Organization**: Templates segregated by user role in `/templates/{role}/`.
- **Styling**: 
  - Vanilla CSS with a focus on dark/light mode compatibility.
  - Theme blocks in CSS files (e.g., `/* DARK DRAGON THEME */`, `/* IVORY THEME */`).
- **Dynamic Content**: Use AJAX to load specific sections into a main container (common in dashboards).

## JavaScript
- Vanilla JS preferred.
- Event-based interactions for dynamic UI elements.
