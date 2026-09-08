package pl.chodan.database

import kotlinx.coroutines.Dispatchers
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.config.Config

class DatabaseProvider : DatabaseProviderContract, KoinComponent {

    private val config by inject<Config>()

    init {
        exposedLogger.info("Connecting to database")

        // baselineOnMigrate: on an existing (pre-Flyway) production DB, the `flat` schema is
        // already populated, so Flyway marks V1 as already applied instead of re-running it and
        // failing on "table already exists" - no data is touched. On a fresh DB, V1 runs normally.
        Flyway.configure()
            .dataSource(config.ktor.database.url, config.ktor.database.user, config.ktor.database.password)
            .schemas("flat")
            .baselineOnMigrate(true)
            .load()
            .migrate()

        Database.connect(
            url = config.ktor.database.url,
            driver = config.ktor.database.driver,
            user = config.ktor.database.user,
            password = config.ktor.database.password,
        )
    }

    override suspend fun <T> dbQuery(block: suspend () -> T): T = newSuspendedTransaction(Dispatchers.IO) {
        addLogger(StdOutSqlLogger)
        block()
    }
}


interface DatabaseProviderContract {
    suspend fun <T> dbQuery(block: suspend () -> T): T
}