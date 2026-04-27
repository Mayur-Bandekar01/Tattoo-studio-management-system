---
phase: 13
slug: invoice-ui-refinement
status: approved
shadcn_initialized: false
preset: none
created: 2026-04-26
---

# Phase 13 — UI Design Contract

> Visual and interaction contract for the Invoice Page UI refinement. Focused on adding left accent branding and standardizing spacings.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | font-awesome |
| Font | Bodoni Moda, Jost |

---

## Spacing Scale

Consistent with global Design System (4-8-16-24-32-48-64):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Accent line width |
| sm | 10px | Small icon containers |
| md | 16px | Inner padding start |
| lg | 24px | Default card padding |
| xl | 32px | Outer layout gaps |

Exceptions: 
- Accent line padding: Content inside containers with left accent line must have `padding-left: 1.5rem` minimum to clear the accent.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.5 |
| Label | 9px | 900 | 1.2 |
| Heading | 1.9rem | 900 | 1.1 |
| Display | 2.5rem | 900 | 1.0 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #030303 | Background |
| Secondary (30%) | #080808 | Cards / Billing Box |
| Accent (10%) | linear-gradient | Left Accent Line (studio-grad) |

Accent reserved for: Left border highlights on interactive cards and branding headers.

---

## Visual Contract: Accent Line

- **Position**: Absolute `left: 0`, `top: 0`, `bottom: 0`.
- **Width**: `4px`.
- **Color**: `var(--studio-grad)`.
- **Radius**: `var(--studio-radius) 0 0 var(--studio-radius)`.
- **Integration**: Must align with the parent's `border-radius` to ensure no overflow on rounded corners.
- **Affected Elements**: `.inv-header-card`, `.inv-table-card`.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | View Bill |
| Empty state heading | No Invoices Yet |
| Empty state body | Once your appointment is completed, your invoice will appear here. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-26
