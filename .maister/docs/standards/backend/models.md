## Models

### Clear Naming
Use singular names for models and plural for tables (or follow framework conventions).

### Timestamps
Include created and updated timestamps for auditing and debugging.

### Database Constraints
Enforce data rules at the database level (NOT NULL, UNIQUE, foreign keys).

### Appropriate Types
Choose data types that match purpose and size requirements.

### Index Foreign Keys
Index foreign key columns and frequently queried fields.

### Multi-Layer Validation
Validate at both model and database levels for defense in depth.

### Clear Relationships
Define relationships with appropriate cascade behaviors and naming.

### Practical Normalization
Balance normalization with query performance needs.

### @Serializable Data Classes for DTOs
All DTO classes are Kotlin `data class` marked `@Serializable`, living under `model/<feature>/dto/`.
*Evidence: 25 of 25 sampled DTO files follow this (confidence 82)*

### Exposed Table Objects Named After Domain Entity
Database table definitions are Kotlin `object`s extending Exposed's `Table`, named as the singular entity (not suffixed), e.g. `object Apartment : Table("flat.apartment")`.
*Evidence: 6 of 6 sampled table definitions follow this (confidence 78)*
