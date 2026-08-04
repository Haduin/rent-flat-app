package pl.chodan.model.contract.dto

import kotlinx.serialization.Serializable

@Serializable
data class UpdateContractDetails(
    val contractId: Int,
    val roomId: Int?,
    val amount: Double?,
    val deposit: Double?,
    val startDate: String?,
    val endDate: String?,
    val payedTillDayOfMonth: String?
)