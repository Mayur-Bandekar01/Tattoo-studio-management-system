---
slug: owner-login-failure
status: investigating
trigger: "after inserting proper detials of owner i am unable to login owner page"
created: 2026-04-22
updated: 2026-04-22
---

# Symptoms
Owner login fails even with correct credentials.

# Hypotheses
- **H1**: The `studio_owner` table is empty (seeding failed).
- **H2**: Column name mismatch in `id` vs `user_id` in session.
- **H3**: Password hashing issue (though seeding used raw strings).
- **H4**: Database naming inconsistency (table still named `owner` but code uses `studio_owner`? No, I added the creation script).

# Evidence
- Error reported by user.
- Recent changes to `auth.py` and `db_maintenance.py`.
- Background commands querying DB are hanging (possible deadlock or pool exhaustion).

# Current Focus
- next_action: Verify if `studio_owner` exists and has the correct schema and data.
