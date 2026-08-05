package pl.chodan.model.persons.dto

import kotlinx.serialization.Serializable

@Serializable
data class UpdatePersonDTO(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val documentNumber: String,
    val nationality: String,
    val status: String
)