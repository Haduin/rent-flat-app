## Project Structure

### Layered Feature-Module Structure for Frontend
Frontend source is organized into: `generated-api/` (OpenAPI-generated clients/models, auto-generated), `api/` (global client instances in `clients.ts` and centralized query keys in `queryKeys.ts`), `features/<domain>/` (per-business-domain api hooks, DTO-to-UI mapper, local types, components, and a barrel `index.ts`), `pages/` (routing and composition only), and `components/ui/` (shared, framework-level UI components).
*Evidence: frontend/modules-structures.md (confidence 88)*

Example: `features/name/{api/useName.ts, api/name.mapper.ts, types/name.types.ts, components/NameCard.tsx, index.ts}`

### Strict Import Direction Between Layers
Explicit allowed-import rules: `pages/` may only import from `features/*/index.ts` and `components/ui/`; a feature (`features/<domain>`) may import `api/clients`, `api/queryKeys`, and `generated-api` (but `generated-api` only inside its mapper file); `components/ui/` must import nothing from `features/` or `api/`; feature modules must never import from each other — if two domains need the same type, it is promoted to a global `src/types/`.
*Evidence: frontend/modules-structures.md, explicit rules stated (confidence 90)*

### Generated API Client Must Never Be Hand-Edited
The `generated-api/` directory (OpenAPI-generated clients/models) is auto-generated via `openapi-generator-cli` (typescript-fetch generator, `Date`→`string`, `set`→`Array` type mappings) and must never be edited manually — regenerate with `pnpm generate-api` after backend API changes.
*Evidence: frontend/modules-structures.md explicit rule + frontend/openapitools.json config (confidence 92 — documentation + config agreement)*

### Mapper Is the Sole Boundary for Generated DTOs
Only a feature's `*.mapper.ts` file may import types from `generated-api/`; it converts the generated DTO into the feature's local UI type, so the hook layer and components never see the raw API DTO shape.
*Evidence: frontend/modules-structures.md (confidence 88)*

Example:
```ts
export function toName(dto: NameDTO): Name { return { id: dto.nameId, name: dto.nameName, ... } }
```

### Local UI Types Decoupled From API Shape
Each feature defines its own local UI type (`types/*.types.ts`) containing only the fields the UI actually uses, kept independent of the API/DTO shape.
*Evidence: frontend/modules-structures.md (confidence 84)*

### Single Source of Truth for API Clients and Query Keys
All TanStack Query cache keys are centralized in one file (`api/queryKeys.ts`); all generated API client instances and their shared Configuration (including auth middleware) live in one file (`api/clients.ts`).
*Evidence: frontend/modules-structures.md (confidence 86)*

### Pages Contain Only Routing and Composition
Files under `pages/` must contain zero business logic and zero data-fetching calls (no `useQuery`/`useMutation`) — they only compose feature components and handle routing.
*Evidence: frontend/modules-structures.md (confidence 88)*

Example:
```tsx
export function NamePage() { return <NameList/>; }
```

### Feature Modules Expose Only a Public Barrel
Each feature module exposes a single `index.ts` barrel file that exports only its public API (hooks, public types); internal directory structure (components, mapper, raw types) stays private unless explicitly re-exported.
*Evidence: frontend/modules-structures.md (confidence 85)*
