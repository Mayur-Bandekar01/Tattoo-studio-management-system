# UI-SPEC: Booking UI Refinement & Logic Hardening (Phase 11)

## 1. Visual Objectives
- **Interaction Feedback**: The transition between Step 1 (Service Selection) and Step 2/3/4 (Details) must be animated and visually signaled.
- **Form Legibility**: Ensure all form controls have high-contrast backgrounds across all themes.
- **Accented Consistency**: Replace all out-of-palette accents (Rose, Purple, Indigo) with the brand-consistent Gold/Silver/Obsidian palette.

## 2. Design Tokens
| Variable | Value | Implementation |
| :--- | :--- | :--- |
| `--studio-input-bg` | `rgba(255, 255, 255, 0.05)` | Root definition for all inputs |
| `--studio-input-focus` | `var(--studio-gold)` | Glowing border on selection |
| `--studio-form-expand` | `0.4s cubic-bezier(0.4, 0, 0.2, 1)` | Transition for form expansion |
| `--accent-gold` | `#cfa844` | PRIMARY ACCENT for the dashboard |

## 3. UI Pillars Mapping

### 🏛️ Hierarchy & Spacing
- **Dynamic Blocks**: All `.dyn-block` and `#commonFields` should use `opacity` and `transform: translateY(10px)` in their hidden state to allow for entrance animations.
- **Service Cards**: Selected card should have a `border: 2px solid var(--studio-gold)` and a subtle `box-shadow: 0 0 15px var(--studio-gold-dim)`.

### 🎨 Color & Contrast
- **Dropdown Visibility**: `option` elements MUST have `background: var(--studio-select-option-bg)` and `color: var(--studio-select-option-text)` to ensure visibility in Noir theme.
- **Variable Alignment**: Fix `bg-[var(--studio-input)]` to correctly reference `--studio-input-bg`.

### 🧱 Component Structure
- **Premium Step Markers**: Step numbers (01, 02...) should use the brand serif font and have a gold glow when reached.
- **Artist Select**: The "No artists available" message should be styled as a premium warning card, not just red text.

## 4. Verification Criteria
- [ ] Selecting a service immediately reveals the next steps with a smooth slide-in animation.
- [ ] Dropdown options are clearly legible in both Noir and Ivory themes.
- [ ] The "Upcoming Session" card and Booking form use the same Gold/Silver accents.
- [ ] No layout shift occurs that prevents the user from seeing the new form fields.

## 5. Technical Requirements (Contract)
- **Visibility Logic**: JavaScript must ensure `display: block` and `classList.add('visible')` are handled sequentially to trigger CSS transitions.
- **Scroll Logic**: `scrollIntoView` should use an offset of `80px` to avoid the fixed header blocking the section title.
