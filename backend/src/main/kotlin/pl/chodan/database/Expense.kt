package pl.chodan.database

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.date

/**
 * Tabela kosztów operacyjnych powiązanych z mieszkaniami/pokojami.
 * Służy do ewidencji kosztów takich jak czynsz do właściciela,
 * rachunki za media (woda, gaz, prąd) oraz podatki (ZUS, PIT).
 */
object OperationalExpense : Table("flat.operational_expense") {
    val id = integer("id").autoIncrement()
    val apartmentId = (integer("apartment_id") references Apartment.id).nullable()
    val roomId = (integer("room_id") references Room.id).nullable()
    val insertDate = date("insert_date")
    val costDate = date("cost_date").nullable()
    val amount = decimal("amount", 10, 2)
    val category = customEnumeration(
        name = "category",
        sql = "VARCHAR(50)",
        fromDb = { value -> ExpenseCategory.valueOf(value as String) },
        toDb = { value -> value.name }
    )
    val description = varchar("description", 255).nullable()
    val invoiceNumber = varchar("invoice_number", 100).nullable()
    val templateId = integer("template_id").references(OperationalExpenseTemplate.id).nullable()

    override val primaryKey = PrimaryKey(id)
}

/**
 * Szablony cyklicznych wydatków operacyjnych (globalne lub przypięte do mieszkania/pokoju).
 */
object OperationalExpenseTemplate : Table("flat.operational_expense_template") {
    val id = integer("id").autoIncrement()
    val apartmentId = (integer("apartment_id") references Apartment.id).nullable()
    val roomId = (integer("room_id") references Room.id).nullable()
    val amount = decimal("amount", 10, 2)
    val category = customEnumeration(
        name = "category",
        sql = "VARCHAR(50)",
        fromDb = { value -> ExpenseCategory.valueOf(value as String) },
        toDb = { value -> value.name }
    )
    val dayOfMonth = integer("day_of_month")
    val description = varchar("description", 255).nullable()
    val invoicePrefix = varchar("invoice_prefix", 50).nullable()
    val active = bool("active").default(true)
    val startMonth = date("start_month").nullable() // yyyy-MM
    val endMonth = date("end_month").nullable() // yyyy-MM

    override val primaryKey = PrimaryKey(id)
}

/**
 * Kategorie kosztów operacyjnych.
 */
enum class ExpenseCategory {
    OWNER_RENT, // czynsz dla właściciela mieszkania
    UTILITY_WATER_COLD,
    UTILITY_WATER_HOT,
    UTILITY_ELECTRICITY,
    UTILITY_GAS,
    TAX_ZUS,
    TAX_PIT,
    OTHER
}
