package pl.chodan.model.expenses.dto

import kotlinx.serialization.Serializable
import pl.chodan.database.ExpenseCategory

@Serializable
data class UpdateOperationalExpenseDTO(
    val id: Int,
    val insertDate: String?,
    val costDate: String?,
    val amount: Double?,
    val category: ExpenseCategory?,
    val description: String?,
    val invoiceNumber: String?
)

