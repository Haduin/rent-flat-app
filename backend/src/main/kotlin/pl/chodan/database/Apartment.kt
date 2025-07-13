package pl.chodan.database

import org.jetbrains.exposed.sql.Table


object Apartment : Table("flat.apartment") {
    val id = integer("id").autoIncrement()
    val name = varchar("name", 255)
    override val primaryKey = PrimaryKey(id)
}





