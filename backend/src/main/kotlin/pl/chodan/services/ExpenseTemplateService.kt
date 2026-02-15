package pl.chodan.services

import org.jetbrains.exposed.sql.andWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.OperationalExpense
import pl.chodan.database.OperationalExpenseTemplate
import java.time.LocalDate
import java.time.YearMonth

class ExpenseTemplateService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()

    data class GenerationResult(val created: Int, val createdIds: List<Int>)

    suspend fun generateMonthlyExpenses(yearMonth: String): GenerationResult = databaseProvider.dbQuery {
        val ym = YearMonth.parse(yearMonth)
        val startDate = LocalDate.parse("$yearMonth-01")
        val endDate = startDate.plusMonths(1).minusDays(1)
        val createdIds = mutableListOf<Int>()

        // Select active templates within optional start/end month range
        val templates = OperationalExpenseTemplate.selectAll()
            .andWhere { OperationalExpenseTemplate.active eq true }
            .andWhere { OperationalExpenseTemplate.startMonth lessEq endDate }
            .andWhere { OperationalExpenseTemplate.endMonth greaterEq startDate }
            .map { it }

        templates.forEach { row ->
            val day = row[OperationalExpenseTemplate.dayOfMonth]
            val insertDate = run {
                val lastDay = ym.lengthOfMonth()
                val d = if (day > lastDay) lastDay else day
                LocalDate.of(ym.year, ym.month, d)
            }

            val templateId = row[OperationalExpenseTemplate.id]

            // Idempotency: check if for this template and date already exists
            val exists = OperationalExpense.selectAll()
                .andWhere { OperationalExpense.templateId eq templateId }
                .andWhere { OperationalExpense.insertDate eq insertDate }
                .any()

            if (!exists) {
                val newId = OperationalExpense.insert {
                    it[OperationalExpense.templateId] = templateId
                    it[OperationalExpense.apartmentId] = row[OperationalExpenseTemplate.apartmentId]
                    it[OperationalExpense.roomId] = row[OperationalExpenseTemplate.roomId]
                    it[OperationalExpense.insertDate] = insertDate
                    it[OperationalExpense.costDate] = null
                    it[OperationalExpense.amount] = row[OperationalExpenseTemplate.amount]
                    it[OperationalExpense.category] = row[OperationalExpenseTemplate.category]
                    it[OperationalExpense.description] = row[OperationalExpenseTemplate.description]
                    it[OperationalExpense.invoiceNumber] = null
                } get OperationalExpense.id
                createdIds.add(newId)
            }
        }

        GenerationResult(created = createdIds.size, createdIds = createdIds)
    }
}
