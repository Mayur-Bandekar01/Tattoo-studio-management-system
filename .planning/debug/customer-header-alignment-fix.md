---
status: fixed
trigger: "the content of header section is completely shifted to left section section so not shift it completelt to left bring alomost nearely to center"
created: 2026-04-26T15:15:00Z
updated: 2026-04-26T15:17:00Z
symptoms:
  - expected: Header content aligned with the centered dashboard content sections.
  - actual: Header content is pinned to the far left and right edges of the main content area.
  - timeline: Recent layout changes to dashboard sections added centering/max-width that the header doesn't follow.
  - reproduction: Visible on any page of the Customer Dashboard on screens wider than 1400px.
Current Focus:
  hypothesis: The .top-header lacks a centering container or max-width constraint consistent with .section-container.
  next_action: Verified fix by wrapping header content in a container and applying max-width/margin-auto.
---

# Evidence
- `customer_dashboard.css`: `.top-header` (lines 371-382) lacked `max-width` and `margin: 0 auto`.
- `customer_dashboard.css`: `.section-container` (lines 363-368) handles centering for other content.
- `dashboard.html`: `<header class="top-header">` contained raw flex items without a centering wrapper.

# Eliminated
- Pure CSS fix on `.top-header`: Ruled out because `.top-header` needs to maintain full-width background for the sticky effect. A wrapper div is the correct architectural approach.

# Resolution
- status: fixed
- fix: Added `.header-content-wrapper` in `dashboard.html` and styled it in `customer_dashboard.css` to match the dashboard's global centering logic.
- files_changed:
    - `frontend/templates/customer/dashboard.html`
    - `frontend/static/css/dashboards/customer_dashboard.css`

