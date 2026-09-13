package pl.chodan.model.expenses.dto

import kotlinx.serialization.Serializable
import pl.chodan.database.ExpenseCategory
import pl.chodan.database.PaymentStatus
import pl.chodan.model.apartment.dto.ApartmentResponse
import pl.chodan.model.apartment.dto.RoomDetails

@Serializable
data class OperationalExpenseDTO(
    val id: Int,
    val apartmentDetails: ApartmentResponse?,
    val roomDetails: RoomDetails?,
    val insertDate: String,
    val costDate: String?,
    val paidDate: String?,
    val amount: Double,
    val category: ExpenseCategory,
    val status: PaymentStatus,
    val description: String?,
    val invoiceNumber: String?,
    val templateId: Int?
)