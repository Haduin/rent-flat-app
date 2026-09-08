package pl.chodan.model.contract.database

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.date
import org.jetbrains.exposed.sql.javatime.datetime
import pl.chodan.database.Person
import pl.chodan.database.Room

object Contract : Table("flat.contract") {
    val id = integer("id").autoIncrement()
    val personId = reference("person_id", Person.id)
    val roomId = (integer("room_id") references Room.id)
    val amount = decimal("amount", 10, 2)
    val deposit = decimal("deposit", 10, 2)
    val depositReturned = bool("deposit_returned").nullable().default(null)
    val startDate = date("start_date")
    val endDate = date("end_date")
    val terminationDate = date("termination_date").nullable()
    val description = varchar("description", 255).nullable()
    val status = customEnumeration(
        name = "status",
        sql = "VARCHAR(255)",
        fromDb = { value -> ContractStatus.valueOf(value as String) },
        toDb = { value -> value.name }
    )
    val payedTillDayOfMonth = varchar("payed_till_day_of_month", 2)
    override val primaryKey = PrimaryKey(id)
}

enum class ContractStatus {
    ACTIVE, TERMINATED
}

// A full snapshot of Contract's mutable fields is written here every time it is created,
// updated or terminated, so the rent/room/date history of a contract can be reconstructed
// and shown as a timeline (e.g. "rent increased from 1500 to 1650 on 2026-01-01").
object ContractHistory : Table("flat.contract_history") {
    val id = integer("id").autoIncrement()
    val contractId = reference("contract_id", Contract.id)
    val changeType = customEnumeration(
        name = "change_type",
        sql = "VARCHAR(255)",
        fromDb = { value -> ContractChangeType.valueOf(value as String) },
        toDb = { value -> value.name }
    )
    val changedAt = datetime("changed_at")
    val roomId = integer("room_id")
    val amount = decimal("amount", 10, 2)
    val deposit = decimal("deposit", 10, 2)
    val depositReturned = bool("deposit_returned").nullable()
    val startDate = date("start_date")
    val endDate = date("end_date")
    val terminationDate = date("termination_date").nullable()
    val description = varchar("description", 255).nullable()
    val status = customEnumeration(
        name = "status",
        sql = "VARCHAR(255)",
        fromDb = { value -> ContractStatus.valueOf(value as String) },
        toDb = { value -> value.name }
    )
    val payedTillDayOfMonth = varchar("payed_till_day_of_month", 2)
    override val primaryKey = PrimaryKey(id)
}

enum class ContractChangeType {
    CREATED, UPDATED, TERMINATED
}