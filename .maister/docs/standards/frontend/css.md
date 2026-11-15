## CSS

### Consistent Methodology
Stick to the project's chosen approach (Tailwind, BEM, CSS modules, etc.) across the entire codebase.

### Work With the Framework
Use framework patterns as intended rather than fighting them with excessive overrides.

### Design Tokens
Establish and document consistent values for colors, spacing, and typography.

### Minimize Custom CSS
Prefer framework utilities to reduce custom styling maintenance.

### Production Optimization
Use CSS purging or tree-shaking to remove unused styles.

### Tailwind Utility Classes Alongside PrimeReact
Styling combines Tailwind's utility-first CSS with the PrimeReact component library and its companion primeflex/primeicons packages, rather than CSS Modules or styled-components.
*Evidence: frontend/tailwind.config.js content globs include node_modules/primereact; package.json deps (confidence 70)*

### `new_ui` Theme Split Into Three Files
`new_ui` styles live in `frontend/new_ui/theme/`, imported by `AppShell` in this order:
- `tokens.css` — `--ku-*` variables (on `body[data-ku-theme='a'], .kwatera-a` so portaled overlays get them), `.kwatera-a` base, `prefers-reduced-motion`;
- `primereact.css` — `.p-*` overrides that adapt PrimeReact to the theme;
- `components.css` — `.ku-*` classes owned by `new_ui/components` wrappers.
Feature code never adds its own stylesheet; a new style goes with the wrapper that uses it.

### Token-Only Values
Colors, font sizes, spacing, radii and shadows in `new_ui` CSS and wrapper inline styles use `var(--ku-*)` tokens (type scale `--ku-text-xs…3xl`, 4px-grid spacing `--ku-space-*`), never raw `oklch()`/hex/px literals. A missing value becomes a new token in `tokens.css`.
