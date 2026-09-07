## Coding Style

### Naming Consistency
Follow established naming patterns for variables, functions, classes, and files throughout the project.

### Automatic Formatting
Use automated tools to enforce consistent indentation, spacing, and line breaks.

### Descriptive Names
Choose names that clearly communicate intent; avoid cryptic abbreviations or single-letter identifiers outside tight loops.

### Focused Functions
Write functions that do one thing well; smaller functions are easier to read, test, and maintain.

### Uniform Indentation
Standardize on spaces or tabs and enforce with editor/linter settings.

### No Dead Code
Remove unused imports, commented-out blocks, and orphaned functions instead of leaving them behind.

### No Backward Compatibility Unless Required
Avoid extra code paths for backward compatibility unless explicitly needed.

### DRY (Don't Repeat Yourself)
Extract repeated logic into reusable functions or modules.

### Constant-First Equality Comparisons
Avoid comparisons shaped like `variable === Enum.VALUE` / `variable !== Enum.VALUE` (including string-literal constants like `"ACTIVE"`). Put the constant/enum member first (Yoda-style): `Enum.VALUE === variable`. Applies across both Kotlin (backend) and TypeScript (frontend). Does not apply to Exposed DSL query builders (`Column eq value`), `switch`/`when`/`case` branches, or comparisons between two variables. Rationale: puts the fixed, known-correct side first for readability ("is status X" reads naturally) and guards against an accidental single `=` typo in languages where that would silently become an assignment.

On the frontend specifically, prefer the typeguard helpers in `frontend/src/utils/typeguards/` (`isEqual(expected, actual)` / `isNotEqual(expected, actual)`) over the raw operator. See the frontend coding-style standard for details on that utils/typeguards module.

```typescript
// Before
if (rowData.status === ContractStatus.TERMINATED) { ... }

// After
if (isEqual(ContractStatus.TERMINATED, rowData.status)) { ... }
```

```kotlin
// Before
if (row[Contract.status] == ContractStatus.TERMINATED) { ... }

// After
if (ContractStatus.TERMINATED == row[Contract.status]) { ... }
```
