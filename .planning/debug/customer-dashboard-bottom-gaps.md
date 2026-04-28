---
status: resolved
trigger: "Excessive white space/gaps at the bottom of the customer dashboard after scrolling."
symptoms:
  - "The dashboard content ends (e.g., Overview cards), but the page continues to scroll for a long distance into a black void."
  - "The scrollbar is very small, suggesting the total page height is calculated to be much larger than the visible content."
created: 2026-04-27
resolved: 2026-04-28
---

# Root Cause Investigation: Customer Dashboard Bottom Gaps

## Root Cause
The issue was caused by missing CSS for `.content-section` - all sections were rendering even when inactive, causing the page height to include all sections' content.

## Fixes Applied
1. Added explicit CSS to hide inactive sections:
   ```css
   .content-section { display: none; }
   .content-section.active { display: block; }
   ```
2. Added missing wrap classes to the global layout resets

## Files Modified
- `frontend/templates/customer/dashboard.html`
