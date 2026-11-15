package pl.chodan.model.expenses.service

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.OperationalExpense
import pl.chodan.database.OperationalExpenseTemplate
import pl.chodan.database.PaymentStatus
import pl.chodan.database.Room
import pl.chodan.model.apartment.database.Apartment
import pl.chodan.model.apartment.dto.ApartmentResponse
import pl.chodan.model.apartment.dto.RoomDetails
import pl.chodan.model.apartment.service.lockRoom
import pl.chodan.model.apartment.service.requireApartment
import pl.chodan.model.expenses.dto.ExpenseConfirmationDTO
import pl.chodan.model.expenses.dto.NewOperationalExpenseDTO
import pl.chodan.model.expenses.dto.OperationalExpenseDTO
import pl.chodan.model.expenses.dto.UpdateOperationalExpenseDTO
import pl.chodan.toLocalDateWithFullPattern
import pl.chodan.ultis.YearMonthString
import java.time.LocalDate
import java.time.YearMonth

class ExpenseService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()

    suspend fun addExpense(dto: NewOperationalExpenseDTO): Int = databaseProvider.dbQuery {
        dto.apartmentId?.let { requireApartment(it) }
        dto.roomId?.let { lockRoom(it) }
        val date = LocalDate.parse(dto.insertDate)
        dto.templateId?.let { requireTemplateFreeInMonth(it, YearMonth.from(date)) }
        OperationalExpense.insert {
            it[apartmentId] = dto.apartmentId
            it[roomId] = dto.roomId
            it[insertDate] = date
            it[costDate] = dto.costDate?.toLocalDateWithFullPattern()
            it[amount] = dto.amount.toBigDecimal()
            it[category] = dto.category
            it[status] = dto.status
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
                        paidDate = row[OperationalExpense.paidDate]?.toString(),
                        amount = row[OperationalExpense.amount].toDouble(),
                        category = row[OperationalExpense.category],
                        status = row[OperationalExpense.status],
                        description = row[OperationalExpense.description],
                        invoiceNumber = row[OperationalExpense.invoiceNumber],
                        templateId = row[OperationalExpense.templateId]
                    )
                }
        }

    suspend fun updateExpense(dto: UpdateOperationalExpenseDTO): Unit = databaseProvider.dbQuery {
        val current = OperationalExpense.select(OperationalExpense.templateId, OperationalExpense.insertDate)
            .where { OperationalExpense.id eq dto.id }.forUpdate().singleOrNull()
            ?: throw ExpenseError.NotFound(dto.id)
        current[OperationalExpense.templateId]?.let { templateId ->
            val date = dto.insertDate?.toLocalDateWithFullPattern() ?: current[OperationalExpense.insertDate]
            requireTemplateFreeInMonth(templateId, YearMonth.from(date), exceptExpenseId = dto.id)
        }
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

        // Locking the templates serializes concurrent runs; the later one then sees the committed expenses.
        val templates = OperationalExpenseTemplate.selectAll()
            .where { OperationalExpenseTemplate.active eq true }
            .orderBy(OperationalExpenseTemplate.id)
            .forUpdate()
            .toList()

        templates.forEach { row ->
            val day = row[OperationalExpenseTemplate.dayOfMonth]
            val insertDate = run {
                val lastDay = ym.lengthOfMonth()
                val d = if (day > lastDay) lastDay else day
                LocalDate.of(ym.year, ym.month, d)
            }

            val templateId = row[OperationalExpenseTemplate.id]

            // whole month, not the exact day: the template's day may have changed since the last run
            if (!templateExpenseExists(templateId, ym)) {
                OperationalExpense.insert {
                    it[OperationalExpense.templateId] = templateId
                    it[OperationalExpense.apartmentId] = row[OperationalExpenseTemplate.apartmentId]
                    it[OperationalExpense.roomId] = row[OperationalExpenseTemplate.roomId]
                    it[OperationalExpense.insertDate] = insertDate
                    it[OperationalExpense.costDate] = null
                    it[OperationalExpense.amount] = row[OperationalExpenseTemplate.amount]
                    it[OperationalExpense.category] = row[OperationalExpenseTemplate.category]
                    it[OperationalExpense.status] = PaymentStatus.PENDING
                    it[OperationalExpense.invoiceNumber] = null
                } get OperationalExpense.id
            }
        }
    }

    suspend fun confirmExpense(dto: ExpenseConfirmationDTO): Unit = databaseProvider.dbQuery {
        val status = OperationalExpense.select(OperationalExpense.status)
            .where { OperationalExpense.id eq dto.expenseId }.forUpdate().singleOrNull()
            ?.get(OperationalExpense.status)
            ?: throw ExpenseError.NotFound(dto.expenseId)
        if (PaymentStatus.PAID == status || PaymentStatus.CANCELLED == status) throw ExpenseError.NotConfirmable(status)
        OperationalExpense.update({ OperationalExpense.id eq dto.expenseId }) {
            it[OperationalExpense.status] = PaymentStatus.PAID
            it[paidDate] = dto.paidDate.toLocalDateWithFullPattern()
            it[amount] = dto.payedAmount.toBigDecimal()
        }
    }

    suspend fun deleteExpense(id: Int) = databaseProvider.dbQuery {
        if (0 == OperationalExpense.deleteWhere { OperationalExpense.id eq id }) throw ExpenseError.NotFound(id)
    }

    /** Locks the template and refuses a second expense of it in [month] (pre-check for unique V7). */
    private fun requireTemplateFreeInMonth(templateId: Int, month: YearMonth, exceptExpenseId: Int? = null) {
        val exists = OperationalExpenseTemplate.selectAll().where { OperationalExpenseTemplate.id eq templateId }.forUpdate().any()
        if (!exists) throw ExpenseError.TemplateNotFound(templateId)
        if (templateExpenseExists(templateId, month, exceptExpenseId)) throw ExpenseError.AlreadyGenerated(month)
    }

    private fun templateExpenseExists(templateId: Int, month: YearMonth, exceptExpenseId: Int? = null): Boolean {
        val query = OperationalExpense.select(OperationalExpense.id)
            .where { OperationalExpense.templateId eq templateId }
            .andWhere { OperationalExpense.insertDate.between(month.atDay(1), month.atEndOfMonth()) }
        exceptExpenseId?.let { query.andWhere { OperationalExpense.id neq it } }
        return query.any()
    }
}
