## Responsive Design

### Mobile-First
Start with mobile layout and progressively enhance for larger screens.

### Standard Breakpoints
Use consistent breakpoints (mobile, tablet, desktop) across the application.

### Fluid Layouts
Use percentage-based widths and flexible containers that adapt to screen size.

### Relative Units
Prefer rem/em over fixed pixels for better scalability.

### Cross-Device Testing
Test across multiple screen sizes to ensure a balanced experience.

### Touch-Friendly
Size tap targets appropriately (minimum 44x44px) for mobile users.

### Mobile Performance
Optimize images and assets for mobile network conditions.

### Readable Typography
Maintain readable font sizes across all breakpoints.

### Content Priority
Show the most important content first on smaller screens.

### Breakpoints
The new UI uses 520px (small phone: full-width inputs and filter toggles), 1024px (phone/tablet vs. desktop: tables stack into cards) and 1440px (wide desktop: optional table columns return). Reuse these values in media queries instead of inventing new ones.

### Tables Stack Below 1024px
`DataTableCard` switches to PrimeReact's stacked layout at ≤1024px; its `breakpoint` prop and the matching `@media (max-width: 1024px)` block in `frontend/new_ui/theme/tokens.css` must stay in sync. In stacked mode each row is a card: column labels stay on one line (never shrink/break mid-word), values right-align and wrap instead, and row actions sit on their own right-aligned row. Verify list pages show no page- or table-level horizontal overflow at 360px, 900px, 1040px and 1280px.

### Touch Targets in Tables
In the stacked (touch) layout, row-action buttons and paginator controls are at least `2.75rem` (44×44px); compact sizes are acceptable only in the desktop table layout.

### No Mid-Word Breaking in Table Cells
`.kwatera-a` sets `overflow-wrap: anywhere` globally (prevents nbsp currency strings blowing out narrow grids), but table cells override it with `overflow-wrap: break-word` and headers use `white-space: nowrap` — otherwise table auto-layout shrinks columns below content width and splits values like "1550,00 zł" into "1550,00 z / ł".
