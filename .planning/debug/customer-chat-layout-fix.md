---
status: investigating
trigger: Fix the message layout and alignment in the Customer Dashboard Chat Section.
created: 2026-04-26
updated: 2026-04-26
symptoms:
  expected: Messages should appear in horizontal sentence format. Sent messages on right, received on left.
  actual: Messages are displayed in vertical/stacked text format (word-by-word or broken lines).
  errors: None reported.
  timeline: Observed after recent UI updates.
  reproduction: Navigate to Customer Dashboard > Messages and send/receive a chat.
---

# Current Focus
- hypothesis: The flex container or bubble wrapper is incorrectly constrained, forcing text to wrap prematurely.
- next_action: Analyze the CSS in messages.html and verify how ch-row and ch-bubble are rendered.

# Evidence
- 2026-04-26: Initial report of vertical text stacking and incorrect alignment.

# Eliminated
(none)
