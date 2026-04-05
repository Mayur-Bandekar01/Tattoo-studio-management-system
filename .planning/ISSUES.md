# Open Enhancements

## Security
### ISS-001: Plain Text Password Storage
**Discovered:** 2026-04-04
**Type:** Security
**Description:** User passwords (Customers, Artists, Owners) are stored and verified in plain text in the database.
**Effort:** Medium (Implementation of hashing/salting with bcrypt or similar)

### ISS-002: Hardcoded Secrets in app.py
**Discovered:** 2026-04-04
**Type:** Security
**Description:** `secret_key` and `MAIL_PASSWORD` are hardcoded in `app.py`.
**Effort:** Quick (Move to environment variables)

## Stability & Performance
### ISS-003: Database Connection Pooling
**Discovered:** 2026-04-04
**Type:** Performance
**Description:** Every request opens a new MySQL connection. No pooling mechanism is used.
**Effort:** Medium (Implement `mysql.connector.pooling` or SQLAlchemy)

### ISS-004: Inconsistent Connection Closing
**Discovered:** 2026-04-04
**Type:** Stability
**Description:** Database connections are not consistently wrapped in `try...finally` blocks, risking connection leaks on errors.
**Effort:** Quick (Refactor `get_db` or use context managers)

## Maintainability
### ISS-005: Raw SQL in Routes
**Discovered:** 2026-04-04
**Type:** Refactoring
**Description:** Business logic is tightly coupled with raw SQL strings in route files.
**Effort:** Substantial (Move to an ORM or Repository pattern)

## Testing & Quality
### ISS-006: Lack of Automated Testing
**Discovered:** 2026-04-04
**Type:** Testing
**Description:** No unit or integration tests exist to verify core flows (booking, inventory, login).
**Effort:** Substantial (Set up Pytest and initial test suite)

# Closed Enhancements
*None yet.*
