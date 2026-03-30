# PLAN-project-analysis

## 1. Project Description
This is the **Tattoo Studio Management System** (Dragon Tattoos), a monolithic web application built using **Python (Flask)** and **MySQL**. 

The system handles studio operations by dividing functionality across three distinct user roles:
*   **Customer:** Can register, log in, browse the tattoo gallery, request appointments, and view their dashboard.
*   **Artist:** Can log in, view/manage their assigned appointments, manage their specific tattoo gallery, and log inventory usage during tattoo sessions.
*   **Owner/Admin:** Can oversee all operations, view statistics, manage all appointments, oversee global inventory, and view financial reports.

The application serves server-rendered HTML pages using Jinja2 templates and maintains stateful sessions for authentication.

---

## 2. Required Folders & Their Purpose
These folders compose the core architecture of the Flask application and are strictly required for it to run:

| Folder | Purpose |
| ------ | ------- |
| `routes/` | **Controllers / Blueprints:** Contains the Python files that define the URL endpoints and business logic for each user role (`artist.py`, `customer.py`, `owner.py`, `auth.py`). This prevents `app.py` from becoming too large. |
| `templates/` | **Views (HTML):** Contains all the Jinja2 HTML templates. Flask heavily relies on this folder to render the web pages sent to the user's browser. |
| `static/` | **Assets & Uploads:** Contains all CSS stylesheets, JavaScript files, static images (like logos), and user uploads (e.g., gallery images, reference images for appointments). Essential for styling and media. |
| `utils/` | **Shared Helpers:** Contains reusable utility functions, such as email sending logic (`email_service.py`) and authorization decorators (`auth_decorators.py`). |
| `.agent/` | **AI & Workflows:** (Specific to this repository) Contains the skills, agent configurations, and testing scripts used by the AI coding assistant. Required for AI tooling but not for the Flask app itself. |
| `docs/` | **Documentation:** Stores planning documents (like this file) and markdown guides. |

---

## 3. Useless / Temporary Files
The following files in the project root are not required for the application to function and appear to be temporary artifacts, old scripts, or generated reports. They can be safely deleted to clean up the project:

*   `find_orphans.py` - A standalone cleanup script used to find unused templates.
*   `orphans_report.txt` - The text output from running the orphan finder.
*   `tmp_fix.py` - A temporary script written for a one-off fix.
*   `ux_audit_results.txt` - Generated audit log.
*   `ux_audit_results2.txt` - Generated audit log.
*   `ux_audit_results3.txt` - Generated audit log.

*(Note: `app.py`, `db.py`, `requirements.txt`, and `.git` are critical and must NOT be deleted).*
