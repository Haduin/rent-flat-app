## Coding Style

### ESLint: TS-recommended + React Hooks/Refresh rules
Linting is built on ESLint's recommended rules and typescript-eslint's recommended rules, plus the react-hooks recommended rule set and a react-refresh rule warning on non-component exports from component files (constant exports allowed).
*Evidence: frontend/eslint.config.js (confidence 80)*

### Type-check Before Bundling
The production build runs the TypeScript project build (`tsc -b`) before Vite (`"build": "tsc -b && vite build"`), so type errors block the build.
*Evidence: frontend/package.json (confidence 80)*

### kebab-case File Names for Pages/Components/Hooks
Non-generated frontend files use kebab-case file names, frequently with a dotted role suffix (`.props.ts`, `.types.ts`, `.hook.tsx`, `.api.ts`, `.validation-schema.ts`). Exceptions exist in `router/` and top-level "commons" files (PascalCase).
*Evidence: 104 of 115 sampled non-generated files (90%) (confidence 82)*

### Relative Imports with Explicit File Extensions
All sampled frontend files use relative imports (no path alias) and include the explicit `.ts`/`.tsx` extension on local module imports.
*Evidence: 251 relative imports sampled across 42 files, no `@/` alias in tsconfig (confidence 80)*

### Typeguard Utilities for Comparisons
`frontend/src/utils/typeguards/` (barrel-exported via its `index.ts`) centralizes small type/value-check predicates instead of inlining raw checks at call sites: `isNull`, `isNullable`, `isNotNullable`, `isNonEmpty`, `isEmpty`, `isEqual(expected, actual)`, `isNotEqual(expected, actual)`. Prefer importing from this module over writing ad-hoc `=== null`, `!== undefined`, or enum/constant equality checks inline. In particular, use `isEqual`/`isNotEqual` for comparisons against an enum member or string-literal status constant rather than a raw `===`/`!==` — see the global coding-style standard's "Constant-First Equality Comparisons" entry for the full rationale. Add new predicates to this same directory rather than creating a new one-off utils location.

```typescript
// Before
rowData.status === ContractStatus.TERMINATED

// After
isEqual(ContractStatus.TERMINATED, rowData.status)
```
*Evidence: frontend/src/utils/typeguards/ (is-null.ts, is-nullable.ts, is-not-nullable.ts, is-non-empty.ts, is-empty.ts, is-equal.ts, is-not-equal.ts, index.ts) — introduced and consolidated into a single directory in this session*
