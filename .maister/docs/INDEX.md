# Documentation Index

**IMPORTANT**: Read this file at the beginning of any development task to understand available documentation and standards.

## Quick Reference

### Project Documentation
Project-level documentation covering vision, goals, architecture, and technology choices.

### Technical Standards
Coding standards, conventions, and best practices organized by domain.

---

## Project Documentation

Located in `.maister/docs/project/`

### Vision (`project/vision.md`)
*Not initialized for this project.* Vision documentation was skipped during setup. If needed later, add it manually using the docs-manager skill.

### Roadmap (`project/roadmap.md`)
*Not initialized for this project.* Roadmap documentation was skipped during setup. If needed later, add it manually using the docs-manager skill.

### Tech Stack (`project/tech-stack.md`)
Kotlin/Ktor + Exposed REST backend (Koin DI, PostgreSQL, Keycloak/JWT auth) paired with a React/TypeScript SPA frontend (Vite, PrimeReact, Tailwind, Redux Toolkit, React Query, OpenAPI-generated API client). Covers backend/frontend/infrastructure choices with rationale and known gaps (no CI/CD, integration-test-heavy coverage, incomplete production compose setup).

### Architecture (`project/architecture.md`)
Two-tier web app: feature-modularized Ktor backend (`model/<feature>/{database,dto,service,routing}` following Routing → Service → Database) and a component-based React SPA mirroring backend feature boundaries, both fronted by Keycloak OIDC/JWT auth. Documents cross-cutting concerns (Application.kt, Module.kt, DatabaseProvider, Koin AppModule), the in-progress flat-to-feature-module migration on branch `dodawania-kosztow`, and known architectural gaps (no ADRs, no CI/CD, thin unit-test coverage).

---

## Technical Standards

### Global Standards

Located in `.maister/docs/standards/global/`

#### Error Handling (`standards/global/error-handling.md`)
Clear user-facing error messages without leaking internals, fail-fast validation, typed exceptions, centralized error handling at boundaries, graceful degradation for non-critical failures, retry with exponential backoff, and resource cleanup in finally blocks.

#### Validation (`standards/global/validation.md`)
Server-side validation as the source of truth (client-side for UX only), early input checks, field-specific error messages, allowlists over blocklists, type/format/range checks, input sanitization against injection, business-rule validation, and consistent enforcement across all entry points.

#### Development Conventions (`standards/global/conventions.md`)
Predictable file/directory structure, up-to-date READMEs, clean version control (commit messages, feature branches, PR descriptions), environment variables for config/secrets, minimal/lean dependencies, consistent code review process, defined test coverage expectations, feature flags over long-lived branches, changelog maintenance, and avoiding speculative "just in case" code.

#### Coding Style (`standards/global/coding-style.md`)
Consistent naming across variables/functions/classes/files, automatic formatting tools, descriptive (non-cryptic) names, small focused functions, uniform indentation, no dead code, no unnecessary backward-compatibility paths, and DRY extraction of repeated logic.

#### Commenting (`standards/global/commenting.md`)
Prefer self-explanatory code over comments, comment sparingly and only where logic isn't self-evident, and avoid changelog-style "recent fix" comments in favor of timeless explanations.

#### Minimal Implementation (`standards/global/minimal-implementation.md`)
Build only methods/classes/functions that are actually called, ensure every method has a caller or clear readability purpose, delete unused exploration artifacts, avoid future stubs and placeholder "for extensibility" code, skip speculative abstractions (factories/strategies/adapters) without immediate need, and review for unused code before committing.

#### Release Process (`standards/global/release-process.md`)
Semantic Versioning (MAJOR.MINOR.PATCH) for releases, a pre-release checklist (bump package.json version, check environment configuration/variables), and a shared Docker-based release pipeline for backend and frontend (build production artifact, build/tag/push a Docker image to Docker Hub under `haduin/mieszkania-backend` and `haduin/mieszkania-frontend`).

#### Tooling (`standards/global/tooling.md`)
pnpm as the required frontend package manager (locked via pnpm-lock.yaml, no npm/yarn lockfiles), including in the Docker build stage which installs pnpm globally and runs a frozen-lockfile install.

### Frontend Standards

Located in `.maister/docs/standards/frontend/`

#### Project Structure (`standards/frontend/project-structure.md`)
Layered feature-module structure (`generated-api/`, `api/`, `features/<domain>/`, `pages/`, `components/ui/`), strict allowed-import direction between layers, never hand-editing the OpenAPI-generated API client, mapper files as the sole boundary that may import generated DTOs, feature-local UI types decoupled from the API shape, centralized API clients/query keys, routing-and-composition-only pages, and feature modules exposing only a public `index.ts` barrel.

#### TypeScript (`standards/frontend/typescript.md`)
Strict compiler settings (`strict: true`, no unused locals/params, exhaustive switch checks, no unacknowledged side-effect imports), and `interface` for object/prop/DTO shapes vs. `type` for unions and simple aliases.

#### Coding Style (`standards/frontend/coding-style.md`)
ESLint built on TS-recommended plus React Hooks/Refresh rule sets, `tsc -b` type-checking gating the production build before Vite bundles, kebab-case file names with dotted role suffixes (`.props.ts`, `.hook.tsx`, `.api.ts`), and relative imports with explicit file extensions (no path alias).

#### CSS (`standards/frontend/css.md`)
Stick to one consistent styling methodology (Tailwind, BEM, CSS modules, etc.), work with the framework rather than overriding it excessively, establish documented design tokens for color/spacing/typography, minimize custom CSS in favor of framework utilities, optimize production builds via CSS purging/tree-shaking, and combine Tailwind utilities with PrimeReact/primeflex/primeicons rather than CSS Modules or styled-components.

#### API (`standards/frontend/api.md`)
Feature-colocated `<feature>.api.ts` files using `@tanstack/react-query`'s `useQuery`/`useMutation`, invalidating query-key constants on success, and surfacing outcomes via a shared `useToast` hook instead of try/catch.

#### Components (`standards/frontend/components.md`)
Single-responsibility components, reusability via configurable props, composability over monoliths, clear/documented prop interfaces with sensible defaults, encapsulation of implementation details, consistent naming, keeping state local unless lifting is needed, minimal props (favor composition/splitting when props grow), usage documentation, and functional modal/dialog forms built with `useFormik` + co-located Yup validation schemas composed from shared field primitives.

#### Accessibility (`standards/frontend/accessibility.md`)
Semantic HTML elements, full keyboard navigation with visible focus indicators, 4.5:1 color contrast (not color-only cues), descriptive alt text and form labels, screen reader testing, ARIA attributes for complex components, proper heading-level structure, and focus management in dynamic content/modals/SPAs.

#### Responsive Design (`standards/frontend/responsive.md`)
Mobile-first layout with progressive enhancement, standard consistent breakpoints, fluid percentage-based layouts, relative units (rem/em) over fixed pixels, cross-device testing, touch-friendly tap targets (min 44x44px), mobile-optimized assets, readable typography across breakpoints, and content-priority ordering on small screens.

### Backend Standards

Located in `.maister/docs/standards/backend/`

#### Architecture (`standards/backend/architecture.md`)
Feature-module layering (`database/dto/service/routing` per feature under `pl.chodan.model.<feature>`) with a fixed Routing → Service → Database request flow, Service classes as `KoinComponent` injecting `DatabaseProviderContract` and wrapping persistence access in `dbQuery { ... }`, JetBrains' "official" Kotlin code style with PascalCase file naming, and fat-JAR packaging as `backend.jar` with Ktor Netty `EngineMain` as the manifest main class.

#### API Design (`standards/backend/api.md`)
RESTful resource-based URLs with correct HTTP methods, consistent endpoint naming, API versioning, plural resource nouns, limited URL nesting (2-3 levels max), query parameters for filtering/sorting/pagination, proper HTTP status codes, and rate-limit response headers.

#### Models (`standards/backend/models.md`)
Clear singular/plural naming conventions for models vs. tables, created/updated timestamps, database-level constraints (NOT NULL, UNIQUE, foreign keys), appropriate data types, indexed foreign keys and frequently queried fields, validation at both model and database layers, well-defined relationships with cascade behavior, and practical normalization balanced against query performance.

#### Database Queries (`standards/backend/queries.md`)
Parameterized queries only (never string-interpolated SQL), avoiding N+1 via eager loading/joins, selecting only needed columns instead of SELECT *, indexing columns used in WHERE/JOIN/ORDER BY, wrapping related operations in transactions, setting query timeouts, and caching expensive/frequent queries.

#### Database Migrations (`standards/backend/migrations.md`)
Reversible migrations with rollback methods, small focused single-change migrations, zero-downtime deployment awareness, separating schema changes from data migrations, careful/concurrent indexing on large tables, descriptive migration names, and never modifying committed migrations after deployment.

### Testing Standards

Located in `.maister/docs/standards/testing/`

#### Test Writing (`standards/testing/test-writing.md`)
Testing behavior rather than implementation details, clear descriptive test names, mocking external dependencies for isolation, fast unit test execution, risk-based test prioritization by business criticality, balancing coverage against velocity, critical-path focus for core workflows, matching edge-case depth to code risk profile, an isolated Docker-dependent `integrationTest` Gradle source set kept separate from the fast default `test` task, and a mirrored unit/integration test structure (mockk + Koin test modules for routing under `src/test`, real-Postgres integration tests for services under `src/integrationTest`) that mirrors the main package layout.

### Infrastructure Standards

Located in `.maister/docs/standards/infrastructure/`

#### Containerization (`standards/infrastructure/containerization.md`)
Multi-stage Docker builds (build in a heavier SDK/toolchain image, run in a slim runtime image — `amazoncorretto:21` for the backend, `nginx:latest` for the frontend's static `dist` output) and docker-compose-provisioned local dependency services (app PostgreSQL, auth PostgreSQL, Keycloak) sharing a `keycloak_network` bridge network.

---

## How to Use This Documentation

1. **Start Here**: Always read this INDEX.md first to understand what documentation exists
2. **Project Context**: Read relevant project documentation before starting work
3. **Standards**: This index only points to the standards — open and follow the specific standard files relevant to your task; don't rely on the index alone
4. **Keep Updated**: Update documentation when making significant changes
5. **Customize**: Adapt all documentation to your project's specific needs

## Updating Documentation

- Project documentation should be updated when goals, tech stack, or architecture changes
- Technical standards should be updated when team conventions evolve
- Always update INDEX.md when adding, removing, or significantly changing documentation
