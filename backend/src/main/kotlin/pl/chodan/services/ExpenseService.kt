package pl.chodan.services

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.NewOperationalExpenseDTO
import pl.chodan.OperationalExpenseDTO
import pl.chodan.UpdateOperationalExpenseDTO
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.OperationalExpense
import pl.chodan.toLocalDateWithFullPattern
import java.time.LocalDate

class ExpenseService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()

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

    suspend fun getExpenses(apartmentId: Int?, roomId: Int?): List<OperationalExpenseDTO> = databaseProvider.dbQuery {
        val query = OperationalExpense.selectAll()
        if (apartmentId != null) {
            query.andWhere { OperationalExpense.apartmentId eq apartmentId }
        }
        if (roomId != null) {
            query.andWhere { OperationalExpense.roomId eq roomId }
        }
        query.orderBy(OperationalExpense.insertDate, SortOrder.DESC)
            .map {
                OperationalExpenseDTO(
                    id = it[OperationalExpense.id],
                    apartmentId = it[OperationalExpense.apartmentId],
                    roomId = it[OperationalExpense.roomId],
                    insertDate = it[OperationalExpense.insertDate].toString(),
                    costDate = it[OperationalExpense.costDate]?.toString(),
                    amount = it[OperationalExpense.amount].toDouble(),
                    category = it[OperationalExpense.category],
                    description = it[OperationalExpense.description],
                    invoiceNumber = it[OperationalExpense.invoiceNumber],
                    templateId = it[OperationalExpense.templateId]
                )
            }
    }

    suspend fun updateExpense(dto: UpdateOperationalExpenseDTO) = databaseProvider.dbQuery {
        OperationalExpense.update({ OperationalExpense.id eq dto.id }) {
            dto.apartmentId?.let { value -> it[apartmentId] = value }
            dto.roomId?.let { value -> it[roomId] = value }
            dto.insertDate?.let { value -> it[insertDate] = value.toLocalDateWithFullPattern() }
            dto.costDate?.let { value -> it[costDate] = value.toLocalDateWithFullPattern() }
            dto.amount?.let { value -> it[amount] = value.toBigDecimal() }
            dto.category?.let { value -> it[category] = value }
            dto.description?.let { value -> it[description] = value }
            dto.invoiceNumber?.let { value -> it[invoiceNumber] = value }
        }
    }

    suspend fun deleteExpense(id: Int): Int = databaseProvider.dbQuery {
        OperationalExpense.deleteWhere { OperationalExpense.id eq id }
    }
}
