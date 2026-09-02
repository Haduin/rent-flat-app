package pl.chodan.testutil

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.Schema
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.module
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.OperationalExpense
import pl.chodan.database.OperationalExpenseTemplate
import pl.chodan.database.Payment
import pl.chodan.database.PaymentSplit
import pl.chodan.database.Person
import pl.chodan.database.Room
import pl.chodan.model.apartment.database.Apartment
import pl.chodan.model.contract.database.Contract
import pl.chodan.model.expenses.service.ExpenseTemplateService

private class KPostgresContainer(image: String) : PostgreSQLContainer<KPostgresContainer>(DockerImageName.parse(image))

/**
 * One real Postgres container for the whole integration-test JVM (the "singleton container"
 * pattern), started lazily on first use and reused by every test class instead of paying the
 * ~seconds-long startup cost per class. Testcontainers' Ryuk sidecar removes it when the JVM
 * exits, so tests never need to call stop() themselves.
 */
object PostgresTestContainer {
    val instance: PostgreSQLContainer<*> by lazy {
        KPostgresContainer("postgres:16-alpine").apply { start() }
    }
}

// Same set DatabaseProvider creates in production, ordered parent-before-child for creation.
private val allTables = arrayOf(
    Apartment, Room, Person, Contract, Payment, PaymentSplit, OperationalExpenseTemplate, OperationalExpense
)

/** Connects Exposed to the shared container and (re)creates the `flat` schema and tables. */
fun connectTestDatabase(): Database {
    val container = PostgresTestContainer.instance
    val database = Database.connect(
        url = container.jdbcUrl,
        driver = container.driverClassName,
        user = container.username,
        password = container.password
    )
    transaction(database) {
        val schema = Schema("flat")
        SchemaUtils.createSchema(schema)
        SchemaUtils.setSchema(schema)
        SchemaUtils.create(*allTables)
    }
    return database
}

/** Wipes every row so each test starts from a clean slate without restarting the container. */
fun Database.cleanTables() {
    transaction(this) {
        allTables.reversed().forEach { it.deleteAll() }
    }
}

/** Real [DatabaseProviderContract] backed by the Testcontainers-managed database, for Koin. */
class TestDatabaseProvider(private val database: Database) : DatabaseProviderContract {
    override suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction(Dispatchers.IO, database) {
            addLogger(StdOutSqlLogger)
            block()
        }
}

/**
 * Global Koin wiring shared by every integration test: the services under test are plain
 * KoinComponents (constructed directly with `SomeService()`, mirroring how routing files use
 * them), so they resolve their dependencies from this global context rather than constructor
 * injection. ExpenseTemplateService is registered unconditionally since both PaymentService and
 * ExpenseService depend on it.
 */
fun startTestKoin(database: Database) {
    startKoin {
        modules(module {
            single<DatabaseProviderContract> { TestDatabaseProvider(database) }
            singleOf(::ExpenseTemplateService)
        })
    }
}

fun stopTestKoin() {
    stopKoin()
}
