package pl.chodan.model.contract.dto

import kotlinx.serialization.Serializable

@Serializable
data class DeleteContractDTO(
    val contractId: Int,
    val terminationDate: String,
    val depositReturned: Boolean?,
    val positiveCancel: Boolean?,
    val description: String?,
)