package pl.chodan.database

import org.jetbrains.exposed.sql.Table

object Person : Table("flat.person") {
    val id = integer("id").autoIncrement()
    val firstName = varchar("first_name", 255)
    val lastName = varchar("last_name", 255)
    val documentNumber = varchar("document_number", 255)
    val nationality = varchar("nationality", 255)
    val email = varchar("email", 255).nullable()
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
