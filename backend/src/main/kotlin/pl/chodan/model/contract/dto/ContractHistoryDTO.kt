package pl.chodan.model.contract.dto

import kotlinx.serialization.Serializable

@Serializable
data class ContractHistoryDTO(
    val id: Int,
    val contractId: Int,
    val changeType: String,
    val changedAt: String,
    val roomId: Int,
    val amount: Double,
    val deposit: Double,
    val depositReturned: Boolean?,
    val startDate: String,
    val endDate: String,
    val terminationDate: String?,
    val description: String?,
    val status: String,
    val payedTillDayOfMonth: String,
)
