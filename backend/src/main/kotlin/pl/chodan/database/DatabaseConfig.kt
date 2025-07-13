package pl.chodan.database

import io.ktor.server.application.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.Schema
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.configureDatabases() {

    val url = environment.config.propertyOrNull("ktor.database.url")?.getString()
        ?: error("Database URL is not configured in application.conf")
    val user = environment.config.propertyOrNull("ktor.database.user")?.getString()
        ?: error("Database user is not configured in application.conf")
    val password = environment.config.propertyOrNull("ktor.database.password")?.getString()
        ?: error("Database password is not configured in application.conf")
    val driver = environment.config.propertyOrNull("ktor.database.driver")?.getString()
        ?: error("Database driver is not configured in application.conf")

    Database.Companion.connect(
        url = url,
        driver = driver,
        user = user,
        password = password,
    )


    transaction {
        val schema = Schema("flat")
        SchemaUtils.createSchema(schema)
        SchemaUtils.setSchema(schema)
        SchemaUtils.create(Apartment, Room, Person, Contract, Payment, UtilityCosts)
    }

}