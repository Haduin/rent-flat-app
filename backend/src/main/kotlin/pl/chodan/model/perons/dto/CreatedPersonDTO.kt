package pl.chodan.model.perons.dto

import kotlinx.serialization.Serializable

@Serializable
data class CreatedPersonDTO(
    val firstName: String,
    val lastName: String,
    val documentNumber: String,
    val nationality: String
)
