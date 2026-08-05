## Database Queries

### Parameterized Queries
Always use parameterized queries or ORM methods; never interpolate user input into SQL.

### Avoid N+1
Use eager loading or joins to fetch related data in one query.

### Select Only Needed Columns
Request only the columns you need rather than SELECT *.

### Index Strategic Columns
Index columns used in WHERE, JOIN, and ORDER BY clauses.

### Transactions
Wrap related operations in transactions to maintain consistency.

### Query Timeouts
Set timeouts to prevent runaway queries from impacting performance.

### Cache Expensive Queries
Cache results of complex or frequent queries when appropriate.

### Expression-Bodied suspend Functions Returning dbQuery Result
Service functions are declared as `suspend fun name(...): T = databaseProvider.dbQuery { ... }` (expression body) rather than block bodies with explicit return.
*Evidence: dominant pattern across sampled service classes, e.g. 5 of 5 methods in PersonService (confidence 74)*
