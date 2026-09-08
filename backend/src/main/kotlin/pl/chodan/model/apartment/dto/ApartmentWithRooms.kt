package pl.chodan.model.apartment.dto

import kotlinx.serialization.Serializable

@Serializable
data class ApartmentWithRooms(
    val apartmentId: Int,
    val apartmentName: String,
    val rooms: List<RoomDetails>
)
