package pl.chodan.model.payments.dto

import kotlinx.serialization.Serializable
import pl.chodan.database.PaymentStatus

@Serializable
data class PaymentEdit(
    val paymentId: Int,
    val amount: Double?,
    val status: PaymentStatus?,
    val payedDate: String?
)