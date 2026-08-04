package pl.chodan.model.expenses.dto

import kotlinx.serialization.Serializable
import pl.chodan.database.ExpenseCategory
import pl.chodan.model.apartment.dto.ApartmentResponse
import pl.chodan.model.room.dto.RoomResponse

@Serializable
data class OperationalExpenseTemplateResponse(
    val id: Int,
    val apartment: ApartmentResponse?,
    val room: RoomResponse?,
    val amount: Double,
    val category: ExpenseCategory,
    val dayOfMonth: Int,
    val active: Boolean
)
