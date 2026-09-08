package pl.chodan.model.expenses.service

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.OperationalExpense
import pl.chodan.database.OperationalExpenseTemplate
import pl.chodan.database.Room
import pl.chodan.model.apartment.database.Apartment
import pl.chodan.model.apartment.dto.ApartmentResponse
import pl.chodan.model.apartment.dto.RoomDetails
import pl.chodan.model.expenses.dto.NewOperationalExpenseDTO
import pl.chodan.model.expenses.dto.OperationalExpenseDTO
import pl.chodan.model.expenses.dto.UpdateOperationalExpenseDTO
import pl.chodan.toLocalDateWithFullPattern
import pl.chodan.ultis.YearMonthString
import java.time.LocalDate
import java.time.YearMonth

class ExpenseService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()
    private val expenseTemplateService by inject<ExpenseTemplateService>()

    suspend fun addExpense(dto: NewOperationalExpenseDTO): Int = databaseProvider.dbQuery {
        OperationalExpense.insert {
            it[apartmentId] = dto.apartmentId
            it[roomId] = dto.roomId
            it[insertDate] = LocalDate.parse(dto.insertDate)
            it[costDate] = dto.costDate?.toLocalDateWithFullPattern()
            it[amount] = dto.amount.toBigDecimal()
            it[category] = dto.category
            it[description] = dto.description
            it[invoiceNumber] = dto.invoiceNumber
            it[templateId] = dto.templateId
        } get OperationalExpense.id
    }

    suspend fun getExpenses(yearMonth: YearMonthString, apartmentId: Int?, roomId: Int?): List<OperationalExpenseDTO> =
        databaseProvider.dbQuery {
            val query = OperationalExpense
                .join(Apartment, JoinType.LEFT, OperationalExpense.apartmentId, Apartment.id)
                .join(Room, JoinType.LEFT, OperationalExpense.roomId, Room.id)
                .selectAll()

            val startDate = yearMonth.toYearMonth().atDay(1)
            val endDate = startDate.plusMonths(1).minusDays(1)

            query.andWhere { OperationalExpense.insertDate.between(startDate, endDate) }

            if (apartmentId != null) {
                query.andWhere { OperationalExpense.apartmentId eq apartmentId }
            }
            if (roomId != null) {
                query.andWhere { OperationalExpense.roomId eq roomId }
            }

            query.orderBy(OperationalExpense.insertDate, SortOrder.DESC)
                .map { row ->
                    OperationalExpenseDTO(
                        id = row[OperationalExpense.id],
                        apartmentDetails = row[OperationalExpense.apartmentId]?.let { apartmentDbId ->
                            ApartmentResponse(
                                id = apartmentDbId,
                                name = row[Apartment.name]
                            )
                        },
                        roomDetails = row[OperationalExpense.roomId]?.let { roomDbId ->
                            RoomDetails(
                                roomId = roomDbId,
                                roomName = row[Room.name],
                                apartmentId = row[Room.apartmentId]
                            )
                        },
                        insertDate = row[OperationalExpense.insertDate].toString(),
                        costDate = row[OperationalExpense.costDate]?.toString(),
                        amount = row[OperationalExpense.amount].toDouble(),
                        category = row[OperationalExpense.category],
                        description = row[OperationalExpense.description],
                        invoiceNumber = row[OperationalExpense.invoiceNumber],
                        templateId = row[OperationalExpense.templateId]
                    )
                }
        }

    suspend fun updateExpense(dto: UpdateOperationalExpenseDTO) = databaseProvider.dbQuery {
        OperationalExpense.update({ OperationalExpense.id eq dto.id }) {
            dto.insertDate?.let { value -> it[insertDate] = value.toLocalDateWithFullPattern() }
            dto.costDate?.let { value -> it[costDate] = value.toLocalDateWithFullPattern() }
            dto.amount?.let { value -> it[amount] = value.toBigDecimal() }
            dto.category?.let { value -> it[category] = value }
            dto.description?.let { value -> it[description] = value }
            dto.invoiceNumber?.let { value -> it[invoiceNumber] = value }
        }
    }

    suspend fun generateMonthlyExpenses(yearMonth: String) = databaseProvider.dbQuery {
        val ym = YearMonth.parse(yearMonth)

        // Select active templates within optional start/end month range
        val templates = OperationalExpenseTemplate.selectAll()
            .andWhere { OperationalExpenseTemplate.active eq true }
            .map { it }

        templates.forEach { row ->
            val day = row[OperationalExpenseTemplate.dayOfMonth]
            val insertDate = run {
                val lastDay = ym.lengthOfMonth()
                val d = if (day > lastDay) lastDay else day
                LocalDate.of(ym.year, ym.month, d)
            }

            val templateId = row[OperationalExpenseTemplate.id]

            val exists = OperationalExpense.selectAll()
                .andWhere { OperationalExpense.templateId eq templateId }
                .andWhere { OperationalExpense.insertDate eq insertDate }
                .any()

            if (!exists) {
                OperationalExpense.insert {
                    it[OperationalExpense.templateId] = templateId
                    it[OperationalExpense.apartmentId] = row[OperationalExpenseTemplate.apartmentId]
                    it[OperationalExpense.roomId] = row[OperationalExpenseTemplate.roomId]
                    it[OperationalExpense.insertDate] = insertDate
                    it[OperationalExpense.costDate] = null
                    it[OperationalExpense.amount] = row[OperationalExpenseTemplate.amount]
                    it[OperationalExpense.category] = row[OperationalExpenseTemplate.category]
                    it[OperationalExpense.invoiceNumber] = null
                } get OperationalExpense.id
            }
        }
    }

    suspend fun deleteExpense(id: Int): Int = databaseProvider.dbQuery {
        OperationalExpense.deleteWhere { OperationalExpense.id eq id }
    }
}
