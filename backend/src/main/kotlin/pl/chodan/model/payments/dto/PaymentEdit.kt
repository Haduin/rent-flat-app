package pl.chodan.model.payments.dto

import kotlinx.serialization.Serializable

@Serializable
data class PaymentEdit(
    val paymentId: Int,
    val amount: Double?,
    val payedDate: String?
)