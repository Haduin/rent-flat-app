package pl.chodan.model.expenses.dto

import kotlinx.serialization.Serializable
import pl.chodan.database.ExpenseCategory

@Serializable
data class UpdateExpenseTemplate(
    val apartmentId: Int?,
    val roomId: Int?,
    val amount: Double?,
    val category: ExpenseCategory?,
    val expenseDate: String?,
//    val active: Boolean?
) {
}