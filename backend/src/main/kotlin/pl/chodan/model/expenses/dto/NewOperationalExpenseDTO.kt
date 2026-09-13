package pl.chodan.model.expenses.dto

import kotlinx.serialization.Serializable
import pl.chodan.database.ExpenseCategory
import pl.chodan.database.PaymentStatus

@Serializable
data class NewOperationalExpenseDTO(
    val apartmentId: Int?,
    val roomId: Int?,
    val insertDate: String,
    val costDate: String?,
    val amount: Double,
    val category: ExpenseCategory,
    val status: PaymentStatus = PaymentStatus.PENDING,
    val description: String?,
    val invoiceNumber: String?,
    val templateId: Int? = null
)