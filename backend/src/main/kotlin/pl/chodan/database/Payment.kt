package pl.chodan.database

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.date

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
    PENDING, PAID, LATE, CANCELLED
}