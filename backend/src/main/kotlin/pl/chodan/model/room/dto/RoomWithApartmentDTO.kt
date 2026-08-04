package pl.chodan.model.room.dto

import kotlinx.serialization.Serializable

@Serializable
data class RoomWithApartmentDTO(val id: Int, val number: String, val apartment: String)