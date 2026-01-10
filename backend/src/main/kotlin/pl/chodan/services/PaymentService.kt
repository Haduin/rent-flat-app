package pl.chodan.services

import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import org.slf4j.LoggerFactory
import pl.chodan.*
import pl.chodan.database.*
import pl.chodan.routing.PaymentSortableField
import pl.chodan.routing.SortOrder
import java.math.BigDecimal
import java.time.LocalDate

class PaymentService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()
    private val logger = LoggerFactory.getLogger(PaymentService::class.java)

    suspend fun generateNewPaymentsForActiveContracts(yearMonth: String) = databaseProvider.dbQuery {
        val startDate = LocalDate.parse("$yearMonth-01")
        val endDate = startDate.plusMonths(1).minusDays(1)

        val activeContracts = Contract.selectAll().where {
            (Contract.startDate lessEq endDate) and
                    (Contract.endDate greaterEq startDate) and
                    (Contract.status eq ContractStatus.ACTIVE)
        }.map { row ->
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

        val existingPayments = Payment.selectAll().where {
            Payment.scopeDate eq yearMonth
        }.map { it[Payment.contractId] }.toSet()

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
        Payment.selectAll().toList().map { resultRow ->
            PaymentDTO(
                id = resultRow[Payment.id],
                contractId = resultRow[Payment.contractId],
                scopeDate = resultRow[Payment.scopeDate],
                payedDate = resultRow[Payment.payedDate]?.toString() ?: null,
                amount = resultRow[Payment.amount].toDouble(),
                status = resultRow[Payment.status]
            )
        }
    }

    suspend fun getPaymentsForMouth(mouth: String, sortFieldName: PaymentSortableField, sortOrder: SortOrder) =
        databaseProvider.dbQuery {
            val payments = Payment.selectAll().where { Payment.scopeDate eq mouth }.toList()
            val roomsAparts = RoomService().getRoomsWithAparts()

            val contractIds = payments.map { it[Payment.contractId] }.distinct()
            val contracts = Contract.selectAll().where { Contract.id inList contractIds }
                .associateBy { it[Contract.id] }

            val personIds = contracts.values.map { it[Contract.personId] }.distinct()
            val persons = Person.selectAll().where { Person.id inList personIds }
                .associateBy { it[Person.id] }

            val query = payments.mapNotNull { paymentRow ->
                val contract = contracts[paymentRow[Payment.contractId]]
                contract?.let {
                    val room = roomsAparts.find { room -> room.id == it[Contract.roomId] }
                    val person = persons[it[Contract.personId]]?.let { personRow ->
                        PersonSmallDetailsDTO(
                            id = personRow[Person.id],
                            firstName = personRow[Person.firstName],
                            lastName = personRow[Person.lastName]
                        )
                    }
                    PaymentHistoryWithPersonDTO(
                        id = paymentRow[Payment.id],
                        contractId = paymentRow[Payment.contractId],
                        scopeDate = paymentRow[Payment.scopeDate],
                        payedDate = paymentRow[Payment.payedDate]?.toString() ?: null,
                        amount = paymentRow[Payment.amount].toDouble(),
                        person = person,
                        room = room,
                        status = paymentRow[Payment.status]
                    )
                }
            }

            when (sortFieldName) {
                PaymentSortableField.FLAT ->
                    if (sortOrder == SortOrder.ASC)
                        query.sortedBy { it.room?.apartment }
                    else
                        query.sortedByDescending { it.room?.apartment }

                PaymentSortableField.PERSON ->
                    if (sortOrder == SortOrder.ASC)
                        query.sortedBy { it.person?.firstName }
                    else
                        query.sortedByDescending { it.person?.firstName }

                PaymentSortableField.DATE ->
                    if (sortOrder == SortOrder.ASC) query.sortedBy { it.payedDate }
                    else query.sortedByDescending { it.payedDate }

                PaymentSortableField.AMOUNT -> if (sortOrder == SortOrder.ASC) query.sortedBy { it.amount }
                else query.sortedByDescending { it.amount }

                PaymentSortableField.STATUS -> if (sortOrder == SortOrder.ASC) query.sortedBy { it.status }
                else query.sortedByDescending { it.status }

                else ->
                    if (sortOrder == SortOrder.ASC)
                        query.sortedBy { it.id }
                    else
                        query.sortedByDescending { it.id }
            }.map { it }.toList()

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

    suspend fun getPaymentSummariesByPerson(): List<PaymentSummaryDTO> = databaseProvider.dbQuery {
        // Get all persons
        val persons = Person.selectAll().toList()

        // For each person, calculate payment summaries
        persons.map { personRow ->
            val personId = personRow[Person.id]
            val firstName = personRow[Person.firstName]
            val lastName = personRow[Person.lastName]

            // Get all contracts for this person
            val contractIds = Contract.selectAll()
                .where { Contract.personId eq personId }
                .map { it[Contract.id] }

            // If no contracts, return zero values
            if (contractIds.isEmpty()) {
                return@map PaymentSummaryDTO(
                    personId = personId,
                    firstName = firstName,
                    lastName = lastName,
                    totalPaid = 0.0,
                    totalPending = 0.0,
                    totalLate = 0.0,
                    totalCancelled = 0.0,
                    paymentCount = 0
                )
            }

            // Get all payments for these contracts
            val payments = Payment.selectAll()
                .where { Payment.contractId inList contractIds }
                .toList()

            // Calculate totals by status
            val totalPaid = payments
                .filter { it[Payment.status] == PaymentStatus.PAID }
                .sumOf { it[Payment.amount].toDouble() }

            val totalPending = payments
                .filter { it[Payment.status] == PaymentStatus.PENDING }
                .sumOf { it[Payment.amount].toDouble() }

            val totalLate = payments
                .filter { it[Payment.status] == PaymentStatus.LATE }
                .sumOf { it[Payment.amount].toDouble() }

            val totalCancelled = payments
                .filter { it[Payment.status] == PaymentStatus.CANCELLED }
                .sumOf { it[Payment.amount].toDouble() }

            PaymentSummaryDTO(
                personId = personId,
                firstName = firstName,
                lastName = lastName,
                totalPaid = totalPaid,
                totalPending = totalPending,
                totalLate = totalLate,
                totalCancelled = totalCancelled,
                paymentCount = payments.size
            )
        }
    }
}
