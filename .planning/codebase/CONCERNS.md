# Concerns

## Security
- **Plain Text Passwords**: Passwords for Customers, Artists, and Owners are stored and verified in plain text. This is a critical security risk.
- **Hardcoded Secrets**: 
  - `app.secret_key` is hardcoded in `app.py`.
  - SMTP credentials (including password) are hardcoded in `app.py`.
- **Session Management**: Sessions are permanent for 2 hours, but without secure password handling, session hijacking or direct DB access is extremely dangerous.

## Stability & Performance
- **Database Connections**: No connection pooling. Every request opens a new connection via `mysql.connector.connect()`. This will not scale well under high load.
- **Connection Leaks**: Connections are closed manually. If an exception occurs, `conn.close()` might be skipped unless wrapped in `try...finally` (which is not consistently seen in `artist.py` or `auth.py`).

## Maintainability
- **Direct SQL**: Logic is heavily dependent on raw SQL strings embedded in routes. This makes it harder to refactor the schema or switch databases later.
- **Circular Imports**: `auth.py` has a note about lazy imports to avoid circular dependencies with `app.py` and `mail`.

## Functional Gaps
- **Validation**: While some basic checks exist, more robust server-side validation and sanitization could be implemented.
- **Testing**: Complete lack of automated tests makes it difficult to verify changes without extensive manual regression testing across three different user roles.
