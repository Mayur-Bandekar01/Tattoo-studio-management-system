# Orchestration Plan: Dashboard Synchronization
**Goal:** Achieve 100% visual and functional parity across Owner, Artist, and Customer dashboards, adhering precisely to the "Vibrant Obsidian" (Dark) and "Studio White" (Light) design system.

## 1. Scope of Work
The user requested that the Artist Dashboard and Customer Dashboard have the **exact same interface** as the Owner Dashboard. This includes:
- **Text & Typography:** Consistent use of Cinzel (Logo), Outfit (Headings), and Inter (Body text), including font sizes, weights, and letter spacing.
- **Colors & Alignment:** Identical color palette (Red-Orange accent, dark navy sidebar, etc.), card layouts, border radii, and internal padding.
- **Visual Concepts:** Exact replication of the stat card colored left-lines, clean inner buttons, and soft glow effects.
- **Theme Engine:** Implementation of the robust `data-theme` switching concept (Dark/White modes) with local storage persistence across all three portals.

## 2. Target Files
### Frontend & UI (`frontend-specialist`)
*   `static/css/artist_dashboard.css`: Copy/adapt the precise layout grid, sidebar, and theme tokens from `owner_dashboard.css`.
*   `static/css/customer_dashboard.css`: Overhaul completely to match `owner_dashboard.css`.
*   `templates/artist/*.html`: Update HTML structural classes, inline styles, and grid layouts to identically match the owner templates.
*   `templates/customer/*.html`: Overhaul HTML structural classes, sidebar, and theme toggling logic.

### Logic & Scripting (`frontend-specialist`, `test-engineer`)
*   Theme switching JavaScript logic (`setTheme`, local storage handling) must be unified across `artist/dashboard.html` and `customer/dashboard.html`.

## 3. Execution Phases (Post-Approval)
Once this plan is approved, we will invoke the following agents in parallel:

**Phase 2: Core Implementation**
- **`frontend-specialist`**: Will rewrite the CSS files (`artist_dashboard.css`, `customer_dashboard.css`) and refactor the HTML templates to guarantee 1:1 parity with the Owner Dashboard. Theme toggle buttons and JavaScript logic will be injected to ensure the "Studio White" concept works perfectly everywhere.
- **`explorer-agent`**: Will map out any unique customer/artist features to ensure they fit correctly into the new uniform layout without breaking functionality.

**Phase 3: Polish & Verification**
- **`test-engineer`**: Will verify that all layouts render correctly, responsive grids hold up, and theme switching persists across page reloads.

## 4. Required Action
Review this plan. Do you approve the synchronization of the Artist and Customer dashboards to exactly match the Owner Dashboard's layout and theme engine?
