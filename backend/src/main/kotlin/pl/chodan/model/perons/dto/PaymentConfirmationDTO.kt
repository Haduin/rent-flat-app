package pl.chodan.model.perons.dto

import kotlinx.serialization.Serializable

@Serializable
data class PaymentConfirmationDTO(
    val paymentId: Int,
    val paymentDate: String,
    val payedAmount: Double,
)