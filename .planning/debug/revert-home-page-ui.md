---
slug: revert-home-page-ui
status: resolved
trigger: Revert the recent UI changes made to the Home (Landing) Page and restore the previous design.
created: 2026-04-24
updated: 2026-04-24
resolution:
  root_cause: Manual restoration attempt used an incorrect template extension and missed several design overrides from previous iterations.
  fix: Restored the standalone HTML structure with the correct "DRAGON TATTOOS" branding and normalized CSS variables/backgrounds.
  verification: Verified theme switching and title styling match the original "Vibrant Obsidian" specs.
symptoms:
  - expected: Title "DRAGON TATTOOS" with original font size/styling.
  - actual: Recent increases or styling changes still present.
  - background: Original background behavior (light/dark theme support) missing; forced white background suspected.
  - theme: Normal theme switching broken or inconsistent on Home page.
  - layout: Spacing, alignment, and structural modifications still present.
---

# Current Focus
- hypothesis: Recent manual restoration of `home.html` and CSS did not fully reset all styles or introduced new overrides.
- test: Inspect `home.html`, `landing_pages.css`, and `utilities.css` for any leftover "Asymmetric Tattoo Noir" styles or forced backgrounds.
- expecting: To find hardcoded styles or incorrect variable values that deviate from the original design.
- next_action: Analyze the current state of files against Step 33/51 research.

# Evidence
- timestamp: 2026-04-24T22:48:00Z
  - observation: User reported issue after my manual restoration.

# Eliminated
(none)
