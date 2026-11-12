package pl.chodan.model.apartment.dto

import kotlinx.serialization.Serializable

/** Body for creating or renaming an apartment or a room — both are just a name. */
@Serializable
data class SaveNameRequest(
    val name: String
) {
    fun validatedName(): String {
        val trimmed = name.trim()
        require(trimmed.isNotEmpty()) { "Nazwa jest wymagana" }
        require(trimmed.length <= MAX_NAME_LENGTH) { "Nazwa może mieć najwyżej $MAX_NAME_LENGTH znaków" }
        return trimmed
    }

    companion object {
        const val MAX_NAME_LENGTH = 255
    }
}
