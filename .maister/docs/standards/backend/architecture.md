## Architecture

### Feature-Module Layering (database/dto/service/routing)
Backend code is organized by business feature under `pl.chodan.model.<feature>` rather than by technical layer at the top level. Each feature module internally splits into the same four sublayers: `database/` (Exposed table objects), `dto/` (@Serializable DTOs), `service/` (business logic), `routing/` (Ktor routes + OpenAPI annotations). Fixed request flow: Routing → Service → Database. The service layer depends only on `DatabaseProviderContract` and dto classes; routing depends only on the service, never directly on database tables.
*Evidence: 7 of 7 sampled feature modules follow this structure; also documented in .maister/docs/project/architecture.md (confidence 90 — code + docs agreement)*
Example: `model/<feature>/{database/Contract.kt, dto/*, service/ContractService.kt, routing/ContractRouting.kt}`

### Service Classes as KoinComponent with Injected DatabaseProvider
Every `*Service` class implements `KoinComponent` and injects `DatabaseProviderContract` via `by inject()`, wrapping all persistence access in `databaseProvider.dbQuery { ... }`.
*Evidence: 7 of 7 sampled Service classes follow this pattern (confidence 85)*
Example:
```kotlin
class PersonService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()
    suspend fun getPersonById(id: Int): PersonDTO? = databaseProvider.dbQuery { ... }
}
```

### Official Kotlin Code Style
The backend opts into JetBrains' "official" Kotlin code style (governs indentation, trailing commas, etc.) via `kotlin.code.style=official` in gradle.properties, and Kotlin source files use PascalCase matching their top-level class/object name (e.g. `PersonService.kt`, `ContractDTO.kt`) — 56 of 56 sampled files follow this.
*Evidence: backend/gradle.properties (confidence 80); 56/56 sampled files (confidence 88)*

### Fat JAR Packaging with Fixed Artifact Name
The backend is packaged as a single executable fat JAR named `backend.jar` (duplicate classpath entries excluded), with Ktor's Netty `EngineMain` set as the manifest main class.
*Evidence: backend/build.gradle.kts (confidence 80)*
