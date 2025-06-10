package pl.chodan

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Serializable
data class ApartmentDTO(val id: Int, val name: String)

@Serializable
data class RoomDTO(val id: Int, val name: String, val apartmentId: Int?)

@Serializable
data class RoomWithApartmentDTO(val id: Int, val number: String, val apartment: String)

@Serializable
data class PersonDTO(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val documentNumber: String?,
    val nationality: String?,
    val status: String
)

@Serializable
data class CreatedPersonDTO(
    val firstName: String,
    val lastName: String,
    val documentNumber: String,
    val nationality: String
)

@Serializable
data class UpdatePersonDTO(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val documentNumber: String,
    val nationality: String,
    val status: String
)

@Serializable
data class ContractDTO(
    val id: Int,
    val person: PersonDTO?,
    val room: RoomWithApartmentDTO?,
    val startDate: String?,
    val endDate: String?,
    val amount: Double?,
    val deposit: Double?
)

@Serializable
data class ContractDB(
    val id: Int,
    val personId: Int,
    val roomId: Int,
    @Contextual
    val amount: BigDecimal?,
    @Contextual
    val deposit: BigDecimal?,
    val startDate: String?,
    val endDate: String?
)

@Serializable
data class RawContract(
    val id: Int,
    val personId: Int,
    val roomId: Int,
    val startDate: String,
    val endDate: String,
    val dueDate: String,
    val amount: Double?,
    val deposit: Double?
)

@Serializable
data class NewContractDTO(
    val personId: Int,
    val roomId: Int,
    val startDate: String,
    val endDate: String,
    val amount: Double,
    val deposit: Double,
    val payedDate: Int
)

@Serializable
data class PaymentDTO(
    val id: Int,
    val contractId: Int,
    val payedDate: String?,
    val scopeDate: String?,
    val amount: Double,
    val status: PaymentStatus
)

@Serializable
data class PersonSmallDetailsDTO(
    val id: Int,
    val firstName: String,
    val lastName: String,
)

@Serializable
data class PaymentHistoryWithPersonDTO(
    val id: Int,
    val contractId: Int,
    val person: PersonSmallDetailsDTO?,
    val room: RoomWithApartmentDTO?,
    val payedDate: String?,
    val scopeDate: String?,
    val amount: Double,
    val status: PaymentStatus
)

@Serializable
data class PaymentConfirmationDTO(
    val paymentId: Int,
    val paymentDate: String,
    val payedAmount: Double,
)

@Serializable
data class ApartmentAndRoomNumberDTO(
    val apartmentName: String,
    val roomName: String,
)

@Serializable
data class AddNewUtilityCostDTO(
    val apartmentId: Int,
    val type: UtilityType,
    val amount: Double,
    val insertDate: String,
)

@Serializable
data class LoginRequest(val username: String, val password: String)

@Serializable
data class Event<T>(
    val eventId: String = UUID.randomUUID().toString(),
    val timestamp: String,
    val data: T
)

// Example of a payload class that can be used with Event<T>
@Serializable
data class PaymentEventPayload(
    val paymentId: Int,
    val amount: Double,
    val status: String
)

@Serializable
data class PaymentConfirmationEvent(
    val eventId: String,
    val eventType: String,
    val timestamp: String,
    val paymentId: Int,
    val paymentDate: String,
    val payedAmount: Double,
    val contractId: Int,
    val status: String
)
