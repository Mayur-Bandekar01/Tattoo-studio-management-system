---
status: investigating
trigger: "Excessive white space/gaps at the bottom of the customer dashboard after scrolling."
symptoms:
  - "The dashboard content ends (e.g., Overview cards), but the page continues to scroll for a long distance into a black void."
  - "The scrollbar is very small, suggesting the total page height is calculated to be much larger than the visible content."
created: 2026-04-27
---

# Root Cause Investigation: Customer Dashboard Bottom Gaps

## Hypotheses
1. [ ] **Hypothesis 1**: One of the hidden sections has a fixed large height or a child element with massive margins that is still affecting the layout even if hidden (though `display: none` should prevent this).
2. [ ] **Hypothesis 2**: The `.main-content` or `.section-container` has excessive `padding-bottom` or `margin-bottom`.
3. [ ] **Hypothesis 3**: An absolutely positioned element (like a modal or lightbox) is incorrectly sized or positioned very far down, expanding the document container.
4. [ ] **Hypothesis 4**: The `min-height: 100vh` on `.main-content` combined with other fixed-height headers is creating overflow, but not thousands of pixels worth.
5. [x] **Hypothesis 5**: A rogue script or a leftover `style` tag from a previous edit has added a massive height to an element.

## Evidence
- None yet.

## Eliminated
- None yet.
