package pl.chodan

import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.date
import org.jetbrains.exposed.sql.transactions.transaction

object DatabaseFactory {
    private val database =
        Database.connect(
            url = "jdbc:postgresql://localhost:61500/mydb",
            user = "myuser",
            password = "mypassword",
            driver = "org.postgresql.Driver",
        )


    fun getDatabase() = database
}

fun configureDatabases() {
    DatabaseFactory.getDatabase()

    transaction {
        SchemaUtils.create(Apartment, Room, Person, Contract, Payment)
    }

}

object Apartment : Table() {
    val id = integer("id").autoIncrement()
    val name = varchar("name", 255)
    override val primaryKey = PrimaryKey(id)
}

// Tabela pokoi
object Room : Table() {
    val id = integer("id").autoIncrement()
    val name = varchar("name", 255)
    val apartmentId = (integer("apartment_id") references Apartment.id).nullable()
    override val primaryKey = PrimaryKey(id)
}

// Tabela osób
object Person : Table() {
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

object Contract : Table() {
    val id = integer("id").autoIncrement()
    val personId = reference("person_id", Person.id)
    val roomId = (integer("room_id") references Room.id)
    val amount = decimal("amount", 10, 2)
    val startDate = date("start_date")
    val endDate = date("end_date")
    val payedDate = date("payed_date")
    override val primaryKey = PrimaryKey(id)
}

object Payment : Table() {
    val id = integer("id").autoIncrement()
    val contractId = reference("contract_id", Contract.id)
    val dueDate = date("due_date").nullable()
    val payedDate = date("payed_date").nullable()
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