# Tech Stack

## Overview

Mieszkania is a full-stack rental/apartment management system: a Kotlin/Ktor REST API backend with a React/TypeScript SPA frontend, backed by PostgreSQL and secured via Keycloak.

## Backend

| Concern | Technology | Version |
|---|---|---|
| Language | Kotlin | 2.1.0 |
| Web framework | Ktor (Netty engine) | 3.0.1 |
| ORM | Exposed | 0.56.0 |
| Dependency injection | Koin | 4.1.0 |
| Database | PostgreSQL | 16.2 |
| Authentication | JWT via Keycloak (OIDC) | Keycloak 25.0.1 |
| API docs | OpenAPI / Swagger (auto-generated from routing) | — |
| Build tool | Gradle (wrapper) | 8.14.4 |
| Testing | JUnit, MockK, Testcontainers | — |

**Rationale**: Kotlin + Ktor + Exposed gives a lightweight, coroutine-friendly REST stack without a heavyweight framework like Spring. Koin keeps DI simple and idiomatic to Kotlin. Keycloak centralizes auth/identity outside the app.

## Frontend

| Concern | Technology | Version |
|---|---|---|
| Language | TypeScript | 5.6.3 |
| Framework | React | 18.3.1 |
| Build tool | Vite | 8.0.7 |
| UI library | PrimeReact | 10.9.7 |
| Styling | Tailwind CSS | 3.4.19 |
| Global state | Redux Toolkit | 2.11.2 |
| Server state | React Query | 5.96.2 |
| Routing | React Router | 7.14.0 |
| Auth | react-oidc-context / oidc-client-ts | 3.3.1 / 3.5.0 |
| Package manager | pnpm | — |
| Linting | ESLint (react-hooks, react-refresh plugins) | 9.39.4 |

**Rationale**: The frontend API client is generated directly from the backend's OpenAPI schema via openapi-generator-cli, keeping the two in sync without hand-written API bindings.

## Infrastructure

- **Containerization**: Docker (separate images for backend and frontend/nginx)
- **Local dev**: Docker Compose stack (`db/docker-compose.yaml`) provisioning PostgreSQL + Keycloak
- **Production**: `prod/` compose setup exists but is not yet fully configured
- **CI/CD**: none currently in place

## Known gaps

- No CI/CD pipeline configured yet
- Test coverage is integration-test-heavy (Testcontainers) with limited unit tests
- Production Docker Compose configuration is incomplete

*Generated from project analysis on 2026-08-04. Update as the stack evolves.*
