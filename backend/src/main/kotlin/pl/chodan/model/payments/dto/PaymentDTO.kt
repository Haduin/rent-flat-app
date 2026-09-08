package pl.chodan.model.payments.dto

import kotlinx.serialization.Serializable
import pl.chodan.database.PaymentStatus

@Serializable
data class PaymentDTO(
    val id: Int,
    val contractId: Int,
    val payedDate: String?,
    val scopeDate: String?,
    val amount: Double,
    val status: PaymentStatus
)