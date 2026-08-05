package pl.chodan.model.payments.service

import org.jetbrains.exposed.sql.*
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import org.slf4j.LoggerFactory
import pl.chodan.database.*
import pl.chodan.model.apartment.database.Apartment
import pl.chodan.model.contract.database.Contract
import pl.chodan.model.contract.database.ContractStatus
import pl.chodan.model.contract.dto.RawContract
import pl.chodan.model.expenses.service.ExpenseTemplateService
import pl.chodan.model.payments.dto.PaymentDTO
import pl.chodan.model.payments.dto.PaymentEdit
import pl.chodan.model.payments.dto.PaymentHistoryWithPersonDTO
import pl.chodan.model.payments.dto.PersonSmallDetailsDTO
import pl.chodan.model.payments.routing.PaymentSortableField
import pl.chodan.model.persons.dto.PaymentConfirmationDTO
import pl.chodan.model.room.dto.RoomWithApartmentDTO
import pl.chodan.routing.SortOrder
import pl.chodan.toLocalDateWithFullPattern
import java.math.BigDecimal
import java.time.LocalDate

class PaymentService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()
    private val logger = LoggerFactory.getLogger(PaymentService::class.java)
    private val expenseTemplateService by inject<ExpenseTemplateService>()

    suspend fun generateNewPaymentsForActiveContracts(yearMonth: String) = databaseProvider.dbQuery {
        val startDate = LocalDate.parse("$yearMonth-01")
        val endDate = startDate.plusMonths(1).minusDays(1)

        val activeContracts = Contract.selectAll()
            .where {
                (Contract.startDate lessEq endDate) and
                        (Contract.endDate greaterEq startDate) and
                        (Contract.status eq ContractStatus.ACTIVE)
            }
            .map { row ->
                RawContract(
                    id = row[Contract.id],
                    personId = row[Contract.personId],
                    roomId = row[Contract.roomId],
                    startDate = row[Contract.startDate].toString(),
                    endDate = row[Contract.endDate].toString(),
                    dueDate = row[Contract.payedTillDayOfMonth],
                    amount = row[Contract.amount].toDouble(),
                    deposit = row[Contract.deposit].toDouble(),
                )
            }

        val existingPayments = Payment.selectAll()
            .where { Payment.scopeDate eq yearMonth }
            .map { it[Payment.contractId] }
            .toSet()

        val paymentsToInsert = activeContracts
            .filterNot { existingPayments.contains(it.id) }
            .map { contract ->
                PaymentData(
                    contractId = contract.id,
                    amount = contract.amount?.toBigDecimal() ?: BigDecimal.ZERO,
                    scopeDate = yearMonth
                )
            }

        if (paymentsToInsert.isNotEmpty()) {
            Payment.batchInsert(paymentsToInsert) { paymentData ->
                this[Payment.contractId] = paymentData.contractId
                this[Payment.amount] = paymentData.amount
                this[Payment.payedDate] = null
                this[Payment.scopeDate] = paymentData.scopeDate
                this[Payment.status] = PaymentStatus.PENDING
            }

            logger.info("✅ Utworzono ${paymentsToInsert.size} nowych płatności dla miesiąca $yearMonth")
        } else {
            logger.info("ℹ️ Brak nowych płatności do wygenerowania w miesiącu $yearMonth")
        }

    }

    private data class PaymentData(
        val contractId: Int,
        val amount: BigDecimal,
        val scopeDate: String
    )


    suspend fun editPayment(paymentEdit: PaymentEdit) = databaseProvider.dbQuery {

        Payment.update({ Payment.id eq paymentEdit.paymentId }) {
            paymentEdit.amount?.let { amount -> it[Payment.amount] = BigDecimal.valueOf(amount) }
            paymentEdit.status?.let { status -> it[Payment.status] = status }
            paymentEdit.payedDate?.let { payedDate -> it[Payment.payedDate] = payedDate.toLocalDateWithFullPattern() }
        }

    }

    suspend fun getAllPayments(): List<PaymentDTO> = databaseProvider.dbQuery {
        Payment.selectAll()
            .toList()
            .map { resultRow ->
                PaymentDTO(
                    id = resultRow[Payment.id],
                    contractId = resultRow[Payment.contractId],
                    scopeDate = resultRow[Payment.scopeDate],
                    payedDate = resultRow[Payment.payedDate]?.toString(),
                    amount = resultRow[Payment.amount].toDouble(),
                    status = resultRow[Payment.status]
                )
            }
    }

    suspend fun getPaymentsForMouth(
        mouth: String,
        sortFieldName: PaymentSortableField = PaymentSortableField.ID,
        sortOrder: SortOrder = SortOrder.ASC,
        page: Int = 0,
        pageSize: Int = 20
    ): List<PaymentHistoryWithPersonDTO> =
        databaseProvider.dbQuery {
            val sortColumn: Expression<*> = when (sortFieldName) {
                PaymentSortableField.PERSON -> Person.firstName
                PaymentSortableField.DATE -> Payment.payedDate
                PaymentSortableField.AMOUNT -> Payment.amount
                PaymentSortableField.STATUS -> Payment.status
                PaymentSortableField.FLAT -> Room.name
                else -> Payment.id
            }
            val sortOrderExpression = when (sortOrder) {
                SortOrder.ASC -> org.jetbrains.exposed.sql.SortOrder.ASC
                SortOrder.DESC -> org.jetbrains.exposed.sql.SortOrder.DESC
            }

            Payment
                .join(Contract, JoinType.LEFT, Payment.contractId, Contract.id)
                .join(Person, JoinType.LEFT, Contract.personId, Person.id)
                .join(Room, JoinType.LEFT, Contract.roomId, Room.id)
                .join(Apartment, JoinType.LEFT, Room.apartmentId, Apartment.id)
                .selectAll()
                .where { Payment.scopeDate eq mouth }
                .orderBy(sortColumn, sortOrderExpression)
                .limit(pageSize)
                .offset((page * pageSize).toLong())
                .map { row ->
                    PaymentHistoryWithPersonDTO(
                        id = row[Payment.id],
                        contractId = row[Payment.contractId],
                        scopeDate = row[Payment.scopeDate],
                        payedDate = row[Payment.payedDate]?.toString(),
                        amount = row[Payment.amount].toDouble(),
                        person = PersonSmallDetailsDTO(
                            id = row[Person.id],
                            firstName = row[Person.firstName],
                            lastName = row[Person.lastName]
                        ),
                        room = RoomWithApartmentDTO(
                            id = row[Room.id],
                            apartment = row[Apartment.name],
                            number = row[Room.name]
                        ),
                        status = row[Payment.status]
                    )
                }

        }

    suspend fun confirmPayment(paymentDto: PaymentConfirmationDTO) = databaseProvider.dbQuery {
        Payment.update({ Payment.id eq paymentDto.paymentId }) {
            it[status] = PaymentStatus.PAID
            it[payedDate] = paymentDto.paymentDate.toLocalDateWithFullPattern()
            it[amount] = BigDecimal.valueOf(paymentDto.payedAmount)
        }
    }

    suspend fun deletePayment(paymentDto: PaymentConfirmationDTO) = databaseProvider.dbQuery {
        Payment.update({ Payment.id eq paymentDto.paymentId }) {
            it[status] = PaymentStatus.CANCELLED
            it[payedDate] = paymentDto.paymentDate.toLocalDateWithFullPattern()
            it[amount] = BigDecimal.valueOf(paymentDto.payedAmount)
        }
    }
}