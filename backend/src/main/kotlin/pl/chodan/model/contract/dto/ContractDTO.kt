package pl.chodan.model.contract.dto

import kotlinx.serialization.Serializable
import pl.chodan.model.persons.dto.PersonDTO
import pl.chodan.model.room.dto.RoomWithApartmentDTO

@Serializable
data class ContractDTO(
    val id: Int,
    val person: PersonDTO?,
    val room: RoomWithApartmentDTO?,
    val startDate: String?,
    val endDate: String?,
    val terminationDate: String?,
    val payedTillDayOfMonth: String?,
    val amount: Double?,
    val deposit: Double?,
    val depositReturned: Boolean?,
    val description: String?,
    val status: String,
    val expiringSoon: Boolean,
)