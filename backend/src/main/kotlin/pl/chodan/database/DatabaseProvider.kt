package pl.chodan.database

import kotlinx.coroutines.Dispatchers
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.exposedLogger
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.config.Config

class DatabaseProvider : DatabaseProviderContract, KoinComponent {

    private val config by inject<Config>()

    init {
        exposedLogger.info("Connecting to database")

        Flyway.configure()
            .dataSource(config.ktor.database.url, config.ktor.database.user, config.ktor.database.password)
            .schemas("flat")
            .baselineOnMigrate(true)
            .validateMigrationNaming(true)
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