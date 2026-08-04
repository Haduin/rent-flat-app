package pl.chodan.model.contract.dto

import kotlinx.serialization.Serializable

@Serializable
data class RawContract(
    val id: Int,
    val personId: Int,
    val roomId: Int,
    val startDate: String,
    val endDate: String,
    val dueDate: String,
    val amount: Double?,
    val deposit: Double?
)