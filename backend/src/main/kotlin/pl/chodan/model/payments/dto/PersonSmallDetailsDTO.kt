package pl.chodan.model.payments.dto

import kotlinx.serialization.Serializable

@Serializable
data class PersonSmallDetailsDTO(
    val id: Int,
    val firstName: String,
    val lastName: String,
)