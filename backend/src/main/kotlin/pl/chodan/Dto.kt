package pl.chodan

import kotlinx.serialization.Serializable

@Serializable
data class ApartmentDTO(val id: Int, val name: String)

@Serializable
data class RoomDTO(val id: Int, val name: String, val apartmentId: Int)

@Serializable
data class PersonDTO(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val documentNumber: String,
    val nationality: String
)

@Serializable
data class ContractDTO(
    val id: Int,
    val personId: Int,
    val roomId: Int,
    val startDate: String,
    val endDate: String,
    val amount: Double
)
