# Open Enhancements

## Security

### ISS-001: Plain Text Password Storage

**Discovered:** 2026-04-04
**Type:** Security
**Description:** User passwords (Customers, Artists, Owners) are stored and verified in plain text. (Audit Note: Resolved on 2026-04-19 but REVERTED per user requirement for direct readability).
**Effort:** Medium

## Stability & Performance

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

# Closed Enhancements

### [FIXED] ISS-006: Customer Dashboard - Aftercare Page Completion

- **Resolution:** Implemented the complete Fitts' Law compliant UI, fixed flexbox breakout bugs on steps and timeline rows, rectified `will-change` anti-aliasing text blurs, and applied `var(--studio-text-primary)` properties for full Ivory light-theme compatibility.

### [FIXED] ISS-002: Hardcoded Secrets in app.py

- **Resolution:** Removed the fallback development secret key. The application now strictly enforces `SECRET_KEY` from the environment/.env.

### [FIXED] ISS-003: Database Connection Pooling

- **Resolution:** Verified that `mysql.connector.pooling` is correctly implemented in `db.py` with a configurable pool size.
