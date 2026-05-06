---
status: resolved
trigger: "Scroll is not working in the Aftercare page of the customer dashboard."
symptoms:
  - "User cannot scroll down to see the full content of the Aftercare section."
  - "The layout seems frozen or restricted in height."
created: 2026-04-27
resolved: 2026-04-28
---

# Root Cause Investigation: Aftercare Scroll Issue

## Root Cause
The issue was caused by:
1. Missing CSS for `.content-section` - hidden sections weren't properly collapsed with `display: none`
2. CSS variable mismatches - aftercare used `--studio-bg` and `--studio-gold` which weren't defined in the dashboard context
3. Missing `min-height: 100%` on `.ac-wrap`

## Fixes Applied
1. Added `.content-section { display: none; }` and `.content-section.active { display: block; }` to dashboard.html
2. Added `min-height: 100%` to `.ac-wrap` in aftercare.html
3. Replaced all `--studio-*` variables with dashboard-compatible variables (`--bg`, `--gold`, `--gold-dim`, etc.)

## Files Modified
- `frontend/templates/customer/dashboard.html`
- `frontend/templates/customer/sections/aftercare.html`
