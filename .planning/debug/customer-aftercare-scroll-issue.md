---
status: investigating
trigger: "Scroll is not working in the Aftercare page of the customer dashboard."
symptoms:
  - "User cannot scroll down to see the full content of the Aftercare section."
  - "The layout seems frozen or restricted in height."
created: 2026-04-27
---

# Root Cause Investigation: Aftercare Scroll Issue

## Hypotheses
1. [ ] **Hypothesis 1**: An element with `overflow: hidden` is wrapping the aftercare content or the entire dashboard.
2. [ ] **Hypothesis 2**: The `main-content` or `.section-container` has a fixed height that is preventing the document from expanding.
3. [ ] **Hypothesis 3**: The recent addition of `display: flex !important` and `flex-direction: column !important` to `.ac-wrap` is causing a layout conflict.
4. [ ] **Hypothesis 4**: A modal or lightbox (even if hidden) has `pointer-events: auto` or is otherwise blocking interaction.
5. [x] **Hypothesis 5**: The `body` or `html` tags have `overflow: hidden` applied, possibly left over from a lightbox session.

## Evidence
- None yet.
