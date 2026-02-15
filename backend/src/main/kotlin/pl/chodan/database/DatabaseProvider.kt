package pl.chodan.database

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.config.Config

class DatabaseProvider : DatabaseProviderContract, KoinComponent {

    private val config by inject<Config>()

    init {
        Database.connect(
            url = config.ktor.database.url,
            driver = config.ktor.database.driver,
            user = config.ktor.database.user,
            password = config.ktor.database.password,
        )

        transaction {
            val schema = Schema("flat")
            SchemaUtils.createSchema(schema)
            SchemaUtils.setSchema(schema)
            SchemaUtils.create(
                Apartment,
                Room,
                Person,
                Contract,
                Payment,
                UtilityCosts,
                OperationalExpenseTemplate,
                OperationalExpense
            )
        }
    }

    override suspend fun <T> dbQuery(block: suspend () -> T): T = newSuspendedTransaction(Dispatchers.IO) {
        addLogger(StdOutSqlLogger)
        block()
    }
}


interface DatabaseProviderContract {
    suspend fun <T> dbQuery(block: suspend () -> T): T
}