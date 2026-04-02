# Testing

## Current State
- **Automated Tests**: None (no `tests/` directory or `pytest` configuration).
- **Static Analysis**: Ruff configured (evidenced by `.ruff_cache`).

## Verification Strategy
- **Manual Testing**: 
  - Verification is performed by logging in as different roles (Customer, Artist, Owner) and exercising dashboard features.
  - Flash messages are used to verify successful operations (e.g., "Appointment approved!").
- **Database Verification**: Checking the `dragon_tattoos` database directly to ensure CRUD operations succeed.

## Future Recommendations
- Implement unit tests for utility services (`email_service.py`).
- Add integration tests for critical flows like booking and appointment approval.
- Use Playwright for E2E testing of the multi-role dashboards.
