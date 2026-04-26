# [UI Restoration & Stability Orchestration]

Restore the "broken" dashboard UI to its previous high-fidelity state while maintaining the new modular Jinja2/Vanilla CSS architecture.

## User Review Required

> [!IMPORTANT]
> This plan involves re-introducing several CSS components into `main_design.css` that were previously omitted during consolidation. This will restore the "Summary Grids" and "Quick Action" layouts that are currently appearing as vertical lists.

## Proposed Changes

### [Phase 1: Foundation Restoration]
- **Frontend-Specialist**: Re-implement `summary-grid`, `summary-card`, `icon-box`, `card-label`, and `card-value` in `main_design.css`.
- **Frontend-Specialist**: Add missing utility classes defined in templates but missing in CSS (`bg-indigo-soft`, `bg-success-soft`, etc.).

### [Phase 2: Interaction Audit]
- **Debugger**: Verify all dashboard links and sidebar toggles. Ensure the active section logic in `owner_dashboard.js` and `customer_dashboard.js` matches the new template IDs.
- **Debugger**: Fix the `toggleSidebar` conflict in `customer_dashboard.js` (Done, but will verify across all portals).

### [Phase 3: Visual Polish]
- **Performance-Optimizer**: Ensure the consolidated CSS is minimized and that there are no layout shifts on route changes.
- **Project-Planner**: Final audit of all dashboard routes for visual regressions.

## Verification Plan

### Automated Tests
- `python .agent/skills/lint-and-validate/scripts/lint_runner.py .`
- `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`

### Manual Verification
- Browser audit of Owner, Artist, and Customer dashboard "Overview" tabs.
- Verification of theme-switching consistency for the new "Summary Grid" components.
