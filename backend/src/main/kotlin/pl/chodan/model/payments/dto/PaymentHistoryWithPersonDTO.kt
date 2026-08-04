package pl.chodan.model.payments.dto

import kotlinx.serialization.Serializable
import pl.chodan.database.PaymentStatus
import pl.chodan.model.room.dto.RoomWithApartmentDTO


@Serializable
data class PaymentHistoryWithPersonDTO(
    val id: Int,
    val contractId: Int,
    val person: PersonSmallDetailsDTO?,
    val room: RoomWithApartmentDTO?,
    val payedDate: String?,
    val scopeDate: String?,
    val amount: Double,
    val status: PaymentStatus
)