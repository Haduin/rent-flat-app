package pl.chodan.model.contract.dto

import kotlinx.serialization.Serializable

@Serializable
data class NewContractDTO(
    val personId: Int,
    val roomId: Int,
    val startDate: String,
    val endDate: String,
    val amount: Double,
    val deposit: Double,
    val payedDate: Int
)