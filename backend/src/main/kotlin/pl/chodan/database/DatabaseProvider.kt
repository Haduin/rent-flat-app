package pl.chodan.database

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import kotlinx.coroutines.Dispatchers
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.exposedLogger
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.config.Config

class DatabaseProvider : DatabaseProviderContract, KoinComponent {

    private val config by inject<Config>()

    init {
        exposedLogger.info("Connecting to database")

        val dataSource = HikariDataSource(HikariConfig().apply {
            jdbcUrl = config.ktor.database.url
            driverClassName = config.ktor.database.driver
            username = config.ktor.database.user
            password = config.ktor.database.password
            maximumPoolSize = config.ktor.database.maxPoolSize
            isAutoCommit = false
            poolName = "mieszkania-db"
        })

        Flyway.configure()
            .dataSource(dataSource)
            .schemas("flat")
            .baselineOnMigrate(true)
            .validateMigrationNaming(true)
            .load()
            .migrate()

        Database.connect(dataSource)
    }

    // SQL is logged by Exposed at DEBUG level (logger "Exposed") — enable it in logback.xml when needed.
    override suspend fun <T> dbQuery(block: suspend () -> T): T = newSuspendedTransaction(Dispatchers.IO) {
        block()
    }
}


interface DatabaseProviderContract {
    suspend fun <T> dbQuery(block: suspend () -> T): T
}
