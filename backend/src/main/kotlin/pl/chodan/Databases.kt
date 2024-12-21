package pl.chodan

import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.date
import org.jetbrains.exposed.sql.transactions.transaction

fun configureDatabases() {
    val database = Database.connect(
        url = "jdbc:postgresql://localhost:61500/mydb",
        user = "myuser",
        password = "mypassword",
        driver = "org.postgresql.Driver",
    )

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
    override val primaryKey = PrimaryKey(id)
}

// Tabela kontraktów
object Contract : Table() {
    val id = integer("id").autoIncrement()
    val personId = reference("person_id", Person.id)
    val roomId = (integer("room_id") references Room.id).nullable()
    val amount = decimal("amount", 10, 2)
    val startDate = date("start_date")
    val endDate = date("end_date")
    override val primaryKey = PrimaryKey(id)
}

object Payment : Table() {
    val id = integer("id").autoIncrement()
    val contractId = reference("contract_id", Contract.id) // Odniesienie do kontraktu
    val dueDate = date("due_date")                         // Termin płatności
    val amount = decimal("amount", 10, 2)                 // Kwota do zapłaty
    val status = varchar("status", 50)                    // Status płatności (np. "PENDING", "PAID", "LATE")
    override val primaryKey = PrimaryKey(id)
}

enum class PaymentStatus {
    PENDING, PAID, LATE
}