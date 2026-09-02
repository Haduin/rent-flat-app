package pl.chodan.model.payments.dto

import kotlinx.serialization.Serializable

@Serializable
data class PaymentSplitDTO(
    val paymentId: Int,
    val amount: Double,
    val paymentDate: String,
)
