# Task: Comprehensive Project Fix & Optimization

The goal is to resolve critical workflow gaps, improve backend stability, and ensure full UI/UX consistency across both themes (Noir and Ivory).

## Phase 1: Backend Infrastructure & Stability
- [ ] **DB Stability (ISS-004)**: Refactor `get_db` and cursor usage to ensure atomic transactions and reliable connection cleanup.
- [ ] **Security Pass**: Parameterize all `f-string` SQL queries in `chat.py` and other routes.
- [ ] **Lead Management API**:
    - [ ] Create `/artist/lead/claim/<int:inquiry_id>` route in `artist.py`.
    - [ ] Update `submit_inquiry` in `public.py` to handle notification logic (optional/future).
    - [ ] Add `status` field to `inquiry` table if not present.

## Phase 2: Artist Dashboard (Lead Workflow & Profile)
- [ ] **Open Leads Visibility**: Update `artist_dashboard` to fetch leads where `artist_id IS NULL` OR `artist_id = current_user`.
- [ ] **Lead Claiming UI**: 
    - [ ] Update `artist/sections/inquiries.html` to show a "Claim Lead" button that hits the new API.
    - [ ] Add visual feedback (Toast/Success message) after claiming.
- [ ] **Profile Update**:
    - [ ] Add `/artist/profile/update` route to `artist.py`.
    - [ ] Create/Update `artist/sections/profile.html` with form fields for name, specialties, and bio.

## Phase 3: Owner & Global UI Improvements
- [ ] **Inquiry Dashboard**: 
    - [ ] Update `owner/sections/inquiries.html` to show assignment status clearly.
- [ ] **Theme Consistency (Ivory Theme)**:
    - [ ] Sweep `dashboard.css`, `auth.css`, and `landing-base.css` for hardcoded colors.
    - [ ] Fix any remaining "dark-on-dark" or "light-on-light" visibility issues in dashboard sections.
- [ ] **Refactoring (ISS-005 - Initial Phase)**:
    - [ ] Move core SQL queries for dashboards into a new `backend/services/` layer to reduce route file bloat.

## Phase 4: Final Verification
- [ ] Test entire flow for Customer -> Lead -> Artist Claim -> Chat.
- [ ] Verify database connection pool health under simulated load.
- [ ] Check theme toggle persistence across all role-based dashboards.
