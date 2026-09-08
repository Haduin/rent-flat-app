## TypeScript

### Strict TypeScript Compiler Settings
TypeScript compilation enforces strict type checking (`strict: true`), disallows unused locals/parameters, requires exhaustive switch handling, and blocks unacknowledged side-effect-only imports.
*Evidence: frontend/tsconfig.app.json and tsconfig.node.json (confidence 85)*

### interface for Object Shapes, type for Unions/Aliases
Hand-written TypeScript favors `interface` for object/record shapes (props, DTOs, models) and `type` for union literals or simple aliases.
*Evidence: ~30 files use interface for shapes vs ~18 files use type almost exclusively for unions (confidence 66 — moderate consistency)*

Example:
```ts
export interface AddContractViewProps { isVisible: boolean; onHide: () => void; }
export type PaymentType = 'income' | 'expense';
```
