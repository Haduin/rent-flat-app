package pl.chodan.model.expenses.dto

import kotlinx.serialization.Serializable

@Serializable
data class ExpenseConfirmationDTO(
    val expenseId: Int,
    val paidDate: String,
    val payedAmount: Double,
)
