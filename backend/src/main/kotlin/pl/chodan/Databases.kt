package pl.chodan

import io.ktor.server.application.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.Schema
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.date
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

    Database.connect(
        url = url,
        driver = driver,
        user = user,
        password = password
    )


    transaction {
        val schema = Schema("flat")
        SchemaUtils.createSchema(schema)
        SchemaUtils.setSchema(schema)
        SchemaUtils.create(Apartment, Room, Person, Contract, Payment)
    }

}

object Apartment : Table("flat.apartment") {
    val id = integer("id").autoIncrement()
    val name = varchar("name", 255)
    override val primaryKey = PrimaryKey(id)
}

object Room : Table("flat.room") {
    val id = integer("id").autoIncrement()
    val name = varchar("name", 255)
    val apartmentId = (integer("apartment_id") references Apartment.id).nullable()
    override val primaryKey = PrimaryKey(id)
}

object Person : Table("flat.person") {
    val id = integer("id").autoIncrement()
    val firstName = varchar("first_name", 255)
    val lastName = varchar("last_name", 255)
    val documentNumber = varchar("document_number", 255)
    val nationality = varchar("nationality", 255)
    val status = customEnumeration(
        name = "status",
        sql = "VARCHAR(255)",
        fromDb = { value -> PersonStatus.valueOf(value as String) },
        toDb = { value -> value.name }
    )
    override val primaryKey = PrimaryKey(id)
}

enum class PersonStatus {
    RESIDENT, NON_RESIDENT
}

object Contract : Table("flat.contract") {
    val id = integer("id").autoIncrement()
    val personId = reference("person_id", Person.id)
    val roomId = (integer("room_id") references Room.id)
    val amount = decimal("amount", 10, 2)
    val deposit = decimal("deposit", 10, 2)
    val startDate = date("start_date")
    val endDate = date("end_date")
    val payedTillDayOfMonth = varchar("payed_till_day_of_month", 2)
    override val primaryKey = PrimaryKey(id)
}

object Payment : Table("flat.payment") {
    val id = integer("id").autoIncrement()
    val contractId = reference("contract_id", Contract.id)
    val payedDate = date("payed_date").nullable()
    val scopeDate = varchar("scope_date", 7)
    val amount = decimal("amount", 10, 2)
    val status = customEnumeration(
        name = "status",
        sql = "VARCHAR(255)",
        fromDb = { value -> PaymentStatus.valueOf(value as String) },
        toDb = { value -> value.name }
    )
    override val primaryKey = PrimaryKey(id)
}

enum class PaymentStatus {
    PENDING, PAID, LATE
}