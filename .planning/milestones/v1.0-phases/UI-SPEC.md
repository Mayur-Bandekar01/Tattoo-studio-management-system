# UI-SPEC: Header Optimization (Phase 9)

## 1. Visual Objectives
- **Breathable Layout**: Increase whitespace between brand (logo/title) and navigation items.
- **Enhanced Legibility**: Boost font size and weight for navigation links.
- **Pill System Refinement**: Transition to a rounded rectangle with generous internal padding ("cellpadding effect").

## 2. Design Tokens
| Variable | Value | Change |
| :--- | :--- | :--- |
| `nav-item-gap` | `2.5rem` (between brand and nav) | Increase |
| `nav-link-fs` | `0.85rem` | Boost size (+18%) |
| `nav-link-fw` | `700` | Boost weight |
| `nav-link-bg` | `rgba(128, 128, 128, 0.1)` | Subtle greyish highlight |
| `nav-link-pad` | `0.7rem 1.4rem` | Internal breathing space |

## 3. UI Pillars Mapping

### 🏛️ Hierarchy & Spacing
- Increase `gap` in `.navbar-inner` to `3rem`.
- Use `margin-right: auto` on brand to push nav to center/right with clear separation.

### 🎨 Color & Contrast
- **Dark Mode**: `rgba(255, 255, 255, 0.1)` for active state.
- **Light Mode**: `rgba(0, 0, 0, 0.06)` for active state.
- Increased text weight (`700`) ensures visibility against background blur.

### 🧱 Component Structure
- `.nav-link`: Rounded rectangle (`border-radius: 14px`).
- Internal padding ensures text is centered and doesn't touch borders.

## 4. Verification Criteria
- [ ] Navigation text is clearly legible without squinting.
- [ ] Logo and Navigation have distinct visual separation.
- [ ] Highlight feels "contained" and modern, not cramped.
- [ ] Active page link is immediately obvious.
