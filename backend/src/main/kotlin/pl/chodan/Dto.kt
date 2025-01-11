package pl.chodan

import kotlinx.serialization.Serializable

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
    val nationality: String
)

@Serializable
data class ContractDTO(
    val id: Int,
    val person: PersonDTO?,
    val room: RoomWithApartmentDTO?,
    val startDate: String?,
    val endDate: String?,
    val amount: Double?
)

@Serializable
data class NewContractDTO(
    val personId: Int,
    val roomId: Int,
    val startDate: String,
    val endDate: String,
    val amount: Double,
    val deposit: Double,
    val payedDate: String
)

@Serializable
data class PaymentDTO(
    val id: Int,               // ID płatności
    val contractId: Int,       // Klucz obcy do kontraktu
    val dueDate: String?,    // Termin płatności
    val payedDate: String?, // Data zapłaty (nullable, jeśli brak płatności)
    val amount: Double,    // Kwota płatności
    val status: PaymentStatus  // Status płatności
)