package pl.chodan.model.room.dto

import kotlinx.serialization.Serializable

@Serializable
data class RoomResponse(
    val id: Int,
    val name: String,
    val apartmentId: Int
)