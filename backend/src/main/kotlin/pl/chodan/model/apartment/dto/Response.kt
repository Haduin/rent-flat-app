package pl.chodan.model.apartment.dto

import kotlinx.serialization.Serializable

@Serializable
data class ApartmentResponse(
    val id: Int,
    val name: String
)

@Serializable
data class RoomDetails(
    val roomId: Int,
    val roomName: String,
    val apartmentId: Int?
)