---
slug: inventory-category-truncation
status: investigating
trigger: "Maintenance Step 'Seed Syringe' Warning: 1265 (01000): Data truncated for column 'category' at row 1"
created: 2026-04-22
updated: 2026-04-22
---

# Symptoms
Warning during `db_maintenance.py` when seeding the 'Syringe' item. The `category` value 'Blood Art' is being truncated.

# Hypotheses
- **H1**: The `category` column in the `inventory` table has a very small character limit (e.g., VARCHAR(5) or similar).

# Evidence
- Error message: `Data truncated for column 'category'`.
- Code uses `'Blood Art'` for category.

# Current Focus
- next_action: Debug session resolved.

# Resolution
- root_cause: The `category` column in the `inventory` table had a character limit that was too small for the value `'Blood Art'`.
- fix: Added an `ALTER TABLE inventory MODIFY COLUMN category VARCHAR(100), MODIFY COLUMN unit VARCHAR(50)` migration step in `db_maintenance.py`.
- verification: Verified by running the server; truncation warning is resolved.
