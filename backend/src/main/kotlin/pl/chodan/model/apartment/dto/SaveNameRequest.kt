package pl.chodan.model.apartment.dto

import kotlinx.serialization.Serializable

/** Body for creating or renaming an apartment or a room — both are just a name. */
@Serializable
data class SaveNameRequest(
    val name: String
)
