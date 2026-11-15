package pl.chodan.testutil

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.DatabaseConfig
import org.jetbrains.exposed.sql.Transaction
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction

/** Exposed retries a failed transaction up to 3 times by default, which would hide the race under test. */
fun connectWithoutRetries(): Database = PostgresTestContainer.instance.let {
    Database.connect(it.jdbcUrl, it.driverClassName, it.username, it.password, databaseConfig = DatabaseConfig { defaultMaxAttempts = 1 })
}

/**
 * Deterministic interleaving for race tests: [competitor] runs its step in a transaction that stays open,
 * then [service] starts and must block on a Postgres lock; only then the competitor commits and the
 * service result (or its exception) is returned.
 */
suspend fun <T> runAgainstUncommittedCompetitor(
    database: Database,
    competitor: suspend Transaction.() -> Unit,
    service: suspend () -> T,
): Result<T> = coroutineScope {
    val competitorReady = CompletableDeferred<Unit>()
    val commit = CompletableDeferred<Unit>()
    val competitorJob = launch(Dispatchers.IO) {
        newSuspendedTransaction(Dispatchers.IO, database) {
            competitor()
            competitorReady.complete(Unit)
            commit.await()
        }
    }
    competitorReady.await()

    val serviceResult = async(Dispatchers.IO) { runCatching { service() } }
    try {
        awaitBlockedOnLock(database, serviceResult)
    } finally {
        commit.complete(Unit)
    }
    competitorJob.join()
    serviceResult.await()
}

private suspend fun awaitBlockedOnLock(database: Database, serviceResult: Deferred<*>) {
    withTimeout(10_000) {
        while (!isAnySessionWaitingOnLock(database)) {
            check(!serviceResult.isCompleted) { "Serwis zakończył się, zanim zaczekał na blokadę konkurenta" }
            delay(50)
        }
    }
}

private fun isAnySessionWaitingOnLock(database: Database): Boolean = transaction(database) {
    exec("SELECT count(*) FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock'") {
        it.next()
        it.getInt(1) > 0
    } ?: false
}
