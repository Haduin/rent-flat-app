# Architecture

## System shape

Mieszkania is a two-tier web application:

- **Backend** (`backend/`): Kotlin/Ktor REST API, feature-modularized, backed by PostgreSQL via Exposed.
- **Frontend** (`frontend/`): React/TypeScript SPA consuming the backend through a generated OpenAPI client.

Both are independently containerized and communicate over HTTP; authentication is delegated to a shared Keycloak instance (OIDC/JWT).

## Backend architecture

The backend is organized by business feature rather than by technical layer at the top level. Each feature module lives under `pl.chodan.model.<feature>` and internally splits into the same four sublayers:

```
model/
  apartment/
    database/   — Exposed Table objects (entities)
    dto/        — @Serializable data transfer objects
    service/    — business logic
    routing/    — Ktor routes + OpenAPI annotations
  contract/
  expenses/
  payments/
  persons/   (package currently spelled "perons" — known typo)
  room/
```

Request flow: **Routing → Service → Database**. Routing handlers parse/validate input and delegate to services; services contain business logic and talk to Exposed table objects; Exposed maps directly onto PostgreSQL tables.

Cross-cutting concerns live outside the feature modules:
- `Application.kt` — entry point, wires routing
- `Module.kt` — authentication (JWT/Keycloak), CORS, content negotiation/serialization, OpenAPI setup
- `database/DatabaseProvider.kt` — connection/session management via Exposed
- Koin `AppModule` — dependency injection wiring across services/repositories

**Migration in progress**: the codebase is mid-refactor (branch `dodawania-kosztow`) from a flat structure (`database/`, `routing/`, `services/`, a shared `Dto.kt`) to the feature-module layout described above. Apartment and Contract modules have already been migrated; Expenses/Payments/Room are following the same pattern.

## Frontend architecture

Component-based SPA structure:

- `src/pages/<feature>/` — feature pages, mirroring backend feature boundaries (apartments, contracts, persons, payments, expenses)
- Shared components (modal, checkbox, select, date-selector, text-field, confirmation-dialog, payment-status-tag, etc.) — each in its own directory
- Generated API client (via `openapi-generator-cli` against the backend's OpenAPI schema) — kept in sync with backend contracts rather than hand-maintained
- Redux Toolkit for global UI/app state; React Query for server-state caching/fetching
- OIDC context (react-oidc-context) wrapping the app for Keycloak-based auth

## Data flow

1. User authenticates against Keycloak; frontend holds the resulting JWT via oidc-client-ts.
2. Frontend calls backend REST endpoints with the JWT attached; Ktor validates it against Keycloak's JWKS.
3. Routing layer delegates to the relevant feature's service, which reads/writes PostgreSQL via Exposed.
4. Responses are serialized DTOs, matching the OpenAPI schema the frontend client was generated from.

## Known architectural gaps

- No architecture decision records (ADRs) — the flat-to-feature-module migration has no documented rationale trail.
- No CI/CD — architecture changes aren't currently verified by automated pipelines.
- Test coverage skews toward integration tests (Testcontainers); unit-level coverage of service logic is thin.

*Generated from project analysis on 2026-08-04. Update as the refactor completes and new modules are added.*
