## Test Writing

### Test Behavior
Focus on what code does, not how it does it, to allow safe refactoring.

### Clear Names
Use descriptive names explaining what's tested and expected (`shouldReturnErrorWhenUserNotFound`).

### Mock External Dependencies
Isolate tests by mocking databases, APIs, and external services.

### Fast Execution
Keep unit tests fast (milliseconds) so developers run them frequently.

### Risk-Based Testing
Prioritize testing based on business criticality and likelihood of bugs.

### Balance Coverage and Velocity
Adjust test coverage based on project needs and team workflow.

### Critical Path Focus
Ensure core user workflows and critical business logic are well-tested.

### Appropriate Depth
Match edge case testing to the risk profile of the code.

### Isolated Integration Test Source Set (Docker-dependent)
Tests that need a real PostgreSQL instance (via Testcontainers) live in a dedicated `integrationTest` Gradle source set/task, separate from the default `test` task, so `./gradlew test` stays fast and does not require Docker. Run integration tests explicitly via `./gradlew integrationTest`.
*Evidence: backend/build.gradle.kts source set config and comment (confidence 85)*

### Mirrored Unit + Integration Test Structure with mockk/Koin
The routing layer is unit-tested under `src/test` with mockk-mocked services registered via a Koin test module (`startTestKoin`/`stopTestKoin`), while the service layer is integration-tested under `src/integrationTest` against a real Postgres test database — both mirroring the main package structure (`model/<feature>/...`).
*Evidence: 9 of 9 sampled test files mirror the main package layout (confidence 82)*
