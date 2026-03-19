# Orchestration Plan: CSS Relocation and Dashboard Fixes

## 1. Goal
Remove CSS files from the combined `static/css/` folder and relocate them to their "respective folders" natively attached to each dashboard, while ensuring the dashboards remain fully functional.

## 2. Proposed Architecture
Currently, files are stored as:
- `static/css/owner_dashboard.css`
- `static/css/artist_dashboard.css`
- `static/css/customer_dashboard.css`

**Proposed Changes:**
1. **Relocate CSS Files:** Delete the shared `static/css/` directory files and recreate them inside role-specific static folders:
   - `static/owner/css/dashboard.css`
   - `static/artist/css/dashboard.css`
   - `static/customer/css/dashboard.css`
   *(If you prefer the CSS to be embedded directly into the HTML `<style>` tags instead, please let me know during approval!)*
   
2. **Update HTML Templates:** 
   - Update `templates/owner/dashboard.html`
   - Update `templates/artist/dashboard.html`
   - Update `templates/customer/dashboard.html`
   - Point the `<link>` tags to the new respective paths.

3. **Validate the Dashboard:** Ensure that the CSS seamlessly applies to the layout and no regressions occur in the visual hierarchy.

## 3. Agents to be Invoked (Phase 2)
Upon your approval, we will orchestrate the following specialists in parallel to implement the changes flawlessly:
1. **`frontend-specialist`**: Handles the physical relocation of the CSS assets and audits the styling rules.
2. **`backend-specialist`**: Verifies pathing issues in Flask's `url_for('static')` logic and correctly routes the specific folder structures.
3. **`test-engineer`**: Runs end-to-end and layout checks to verify that the dashboard structure applies the theme accurately.
