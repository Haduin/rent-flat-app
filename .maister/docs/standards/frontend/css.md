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
