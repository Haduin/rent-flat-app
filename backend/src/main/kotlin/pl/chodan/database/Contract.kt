package pl.chodan.database

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.date

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