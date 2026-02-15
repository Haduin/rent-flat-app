package pl.chodan

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import pl.chodan.database.ContractStatus
import pl.chodan.database.PaymentStatus
import pl.chodan.database.UtilityType
import pl.chodan.database.ExpenseCategory
import java.math.BigDecimal

@Serializable
enum class ExpenseCategorySerializable {
    OWNER_RENT,
    UTILITY_WATER_COLD,
    UTILITY_WATER_HOT,
    UTILITY_ELECTRICITY,
    UTILITY_GAS,
    TAX_ZUS,
    TAX_PIT,
    OTHER
}

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
    val terminationDate: String?,
    val payedTillDayOfMonth: String?,
    val amount: Double?,
    val deposit: Double?,
    val depositReturned: Boolean?,
    val description: String?,
    val status: String,
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
data class DeleteContractDTO(
    val contractId: Int,
    val terminationDate: String,
    val depositReturned: Boolean?,
    val positiveCancel: Boolean?,
    val description: String?,
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
data class PaymentSummaryDTO(
    val personId: Int,
    val firstName: String,
    val lastName: String,
    val totalPaid: Double,
    val totalPending: Double,
    val totalLate: Double,
    val totalCancelled: Double,
    val paymentCount: Int
)

@Serializable
data class UpdateContractDetails(
    val contractId: Int,
    val roomId: Int?,
    val amount: Double?,
    val deposit: Double?,
    val startDate: String?,
    val endDate: String?,
    val payedTillDayOfMonth: String?
)

@Serializable
data class PaymentEdit(
    val paymentId: Int,
    val amount: Double?,
    val status: PaymentStatus?,
    val payedDate: String?
)

@Serializable
data class OperationalExpenseDTO(
    val id: Int,
    val apartmentId: Int?,
    val roomId: Int?,
    val insertDate: String,
    val costDate: String?,
    val amount: Double,
    val category: ExpenseCategory,
    val description: String?,
    val invoiceNumber: String?,
    val templateId: Int?
)

@Serializable
data class NewOperationalExpenseDTO(
    val apartmentId: Int?,
    val roomId: Int?,
    val insertDate: String,
    val costDate: String?,
    val amount: Double,
    val category: ExpenseCategory,
    val description: String?,
    val invoiceNumber: String?,
    val templateId: Int? = null
)

@Serializable
data class UpdateOperationalExpenseDTO(
    val id: Int,
    val apartmentId: Int?,
    val roomId: Int?,
    val insertDate: String?,
    val costDate: String?,
    val amount: Double?,
    val category: ExpenseCategory?,
    val description: String?,
    val invoiceNumber: String?
)