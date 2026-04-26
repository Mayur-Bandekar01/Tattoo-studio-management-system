---
status: resolved
trigger: "nothing content is showing in other landing pages so fix it"
slug: missing-landing-content
created: 2026-04-25T00:43:42Z
updated: 2026-04-25T00:43:42Z
---

# Debug Session: Missing Landing Content [RESOLVED]

## Root Cause Found
The IntersectionObserver in `landing_pages.js` was updated to watch for the `.reveal` class (used in the new `home.html` design), but other templates (`gallery.html`, `about.html`, etc.) were still using the legacy `.scroll-reveal` class. Since the observer only watched for `.reveal`, elements with `.scroll-reveal` remained at `opacity: 0` and were never transitioned to `visible`.

## Fix Applied
- Unified all landing templates (`gallery.html`, `about.html`, `services.html`, `contact.html`) to use the `.reveal` and `.reveal-d*` classes.
- Consolidated `landing_pages.css` to handle only the `.reveal` system and removed redundant legacy `.scroll-reveal` definitions.
- Verified that `landing_pages.js` correctly observes the unified `.reveal` class.

## Verification
- All pages now use a consistent reveal system.
- IntersectionObserver correctly triggers visibility on scroll.
- Redundant CSS removed to optimize bundle weight.
