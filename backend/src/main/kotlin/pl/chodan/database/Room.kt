package pl.chodan.database

import org.jetbrains.exposed.sql.Table

object Room : Table("flat.room") {
    val id = integer("id").autoIncrement()
    val name = varchar("name", 255)
    val apartmentId = (integer("apartment_id") references Apartment.id).nullable()
    override val primaryKey = PrimaryKey(id)
}
