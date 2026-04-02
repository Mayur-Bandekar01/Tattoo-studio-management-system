# PLAN: No-Scroll Customer Dashboard Implementation

## Analysis of the Issue
The user explicitly requires a "no-scroll" experience, meaning the dashboard must fit within the 100vh viewport without triggering global vertical scrollbars. 

### Potential Issues
1. **Cumulative Vertical Spacing**: `main-content` padding + `top-header` margin/padding + section content may exceed 100vh.
2. **Fixed Height Sections**: Some sections might have fixed heights that don't account for smaller viewports.
3. **Content Overflow**: Large tables, multiple cards (Aftercare), or chat areas without proper internal scroll management.

## Orchestration Strategy (Phase 1)
We will use three specialist agents to analyze and propose solutions:
1. **`project-planner`**: Coordinate the high-level roadmap and deliverables.
2. **`frontend-specialist`**: Conduct a CSS audit and design the viewport-constrained layout (Flex/Grid).
3. **`performance-optimizer`**: Ensure that the "no-scroll" layout doesn't lead to complex reflows or render bottlenecks on mobile/desktop.

## Proposed Solutions (To be explored)
- **Solution A: The Viewport Grid**: Convert the main layout into a 100vh grid where the header is a fixed row and the content is a `flex-1` container with `overflow-y: auto`.
- **Solution B: Internal Section Scrolling**: Instead of the whole page scrolling, each section becomes a self-contained scrollable area (e.g., chat window stays fixed, gallery scrolls internally).
- **Solution C: Compaction & Progressive Disclosure**: Use accordion or tabbed sub-navigation within sections to reduce the initial vertical footprint.

## Next Steps
1. **Agent Invocation**: Call `project-planner` to finalize this PLAN.md.
2. **Request User Approval** to move to Phase 2 (Implementation).
