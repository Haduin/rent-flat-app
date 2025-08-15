package pl.chodan.database

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp

enum class UtilityType(name: String) {
    WATER_COLD("ZIMNA"), WATER_HOT("CIEPŁA"), ELECTRICITY("PRĄD"), GAS("GAZ");
}


object UtilityCosts : Table("flat.utility_costs") {
    val id = integer("id").autoIncrement()
    val apartmentId = (integer("apartment_id") references Apartment.id).nullable()
    val insertDate = timestamp("insert_date")
    val value = decimal("value", 10, 2)
    val type = customEnumeration(
        name = "type",
        sql = "VARCHAR(50)",
        fromDb = { value -> UtilityType.valueOf(value as String) },
        toDb = { value -> value.name }
    )

    override val primaryKey = PrimaryKey(id)
}