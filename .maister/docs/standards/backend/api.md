## API Design

### RESTful Principles
Use resource-based URLs with appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE).

### Consistent Naming
Use lowercase, hyphenated or underscored names consistently across endpoints.

### Versioning
Implement versioning (URL path or headers) to manage breaking changes.

### Plural Nouns
Use plural nouns for resources (`/users`, `/products`).

### Limited Nesting
Keep URL nesting to 2-3 levels maximum for readability.

### Query Parameters
Use query parameters for filtering, sorting, and pagination.

### Proper Status Codes
Return appropriate HTTP status codes (200, 201, 400, 404, 500).

### Rate Limit Headers
Include rate limit information in response headers.

### Ktor Route Registration via Application Extension Function
Each routing file exposes a single `fun Application.configure<Feature>Routing()` that wraps its endpoints in `authenticate("auth-jwt") { route("/<feature-plural>", { tags = ... }) { ... } }`.
*Evidence: 7 of 7 sampled routing files follow this (confidence 85)*

### ktor-openapi Route Metadata with operationId
Every route handler documents itself with a ktor-openapi block including description, operationId, and typed request/response bodies.
*Evidence: operationId found on 100% of sampled handlers across 7 routing files (confidence 85)*

### Plural, kebab-case REST Resource Paths
Top-level route segments are plural nouns; multi-word resources use kebab-case (e.g. `/persons`, `/contracts`, `/expense-template` is a known singular outlier).
*Evidence: 6 of 7 sampled route roots are plural (confidence 72)*
