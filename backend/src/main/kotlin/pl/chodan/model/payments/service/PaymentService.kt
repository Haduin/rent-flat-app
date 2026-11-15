package pl.chodan.model.payments.service

import org.jetbrains.exposed.sql.Expression
import org.jetbrains.exposed.sql.vendors.ForUpdateOption
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.sum
import org.jetbrains.exposed.sql.update
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import org.slf4j.LoggerFactory
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.Payment
import pl.chodan.database.PaymentSplit
import pl.chodan.database.PaymentStatus
import pl.chodan.database.Person
import pl.chodan.database.Room
import pl.chodan.model.apartment.database.Apartment
import pl.chodan.model.contract.database.Contract
import pl.chodan.model.contract.dto.RawContract
import pl.chodan.model.payments.dto.PaymentDTO
import pl.chodan.model.payments.dto.PaymentEdit
import pl.chodan.model.payments.dto.PaymentHistoryWithPersonDTO
import pl.chodan.model.payments.dto.PaymentSplitDTO
import pl.chodan.model.payments.dto.PaymentSplitEntryDTO
import pl.chodan.model.payments.dto.PersonSmallDetailsDTO
import pl.chodan.model.payments.routing.PaymentSortableField
import pl.chodan.model.persons.dto.PaymentConfirmationDTO
import pl.chodan.model.room.dto.RoomWithApartmentDTO
import pl.chodan.routing.SortOrder
import pl.chodan.error.ValidationException
import pl.chodan.toLocalDateWithFullPattern
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth

class PaymentService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()
    private val logger = LoggerFactory.getLogger(PaymentService::class.java)

    suspend fun generateNewPaymentsForActiveContracts(yearMonth: String) = databaseProvider.dbQuery {
        val startDate = LocalDate.parse("$yearMonth-01")
        val endDate = startDate.plusMonths(1).minusDays(1)

        val activeContracts = Contract.selectAll()
            .where { Contract.activeBetween(startDate, endDate) }
            .orderBy(Contract.id)
            .forUpdate(ForUpdateOption.PostgreSQL.ForKeyShare)
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
            Payment.batchInsert(paymentsToInsert, ignore = true) { paymentData ->
                this[Payment.contractId] = paymentData.contractId
                this[Payment.amount] = paymentData.amount
                this[Payment.payedDate] = null
                this[Payment.scopeDate] = paymentData.scopeDate
                this[Payment.status] = PaymentStatus.PENDING
            }

            logger.info("✅ Do wygenerowania ${paymentsToInsert.size} płatności dla miesiąca $yearMonth")
        } else {
            logger.info("ℹ️ Brak nowych płatności do wygenerowania w miesiącu $yearMonth")
        }

    }

    private data class PaymentData(
        val contractId: Int,
        val amount: BigDecimal,
        val scopeDate: String
    )


    /** Only a confirmed (PAID) payment is edited, and only its date and amount; the status follows from confirm/split. */
    suspend fun editPayment(paymentEdit: PaymentEdit): Unit = databaseProvider.dbQuery {
        val payment = lockPayment(paymentEdit.paymentId)
        if (PaymentStatus.PAID != payment[Payment.status]) throw PaymentError.NotEditable(payment[Payment.status])
        paymentEdit.amount?.let { amount ->
            val newAmount = BigDecimal.valueOf(amount)
            val contractAmount = Contract.select(Contract.amount).where { Contract.id eq payment[Payment.contractId] }
                .single()[Contract.amount]
            if (newAmount > contractAmount) {
                throw ValidationException("Należność nie może być wyższa niż czynsz z umowy ($contractAmount zł)")
            }
            val instalments = paidInInstalments(paymentEdit.paymentId)
            if (newAmount < instalments) {
                throw ValidationException("Należność nie może być niższa niż suma wpłaconych rat ($instalments zł)")
            }
        }
        Payment.update({ Payment.id eq paymentEdit.paymentId }) {
            paymentEdit.amount?.let { amount -> it[Payment.amount] = BigDecimal.valueOf(amount) }
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

    suspend fun getPaymentsForMonth(
        month: String,
        sortFieldName: PaymentSortableField = PaymentSortableField.ID,
        sortOrder: SortOrder = SortOrder.ASC
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

            val splitSum = PaymentSplit.amount.sum()
            val splitTotals = PaymentSplit
                .join(Payment, JoinType.INNER, PaymentSplit.paymentId, Payment.id)
                .select(PaymentSplit.paymentId, splitSum)
                .where { Payment.scopeDate eq month }
                .groupBy(PaymentSplit.paymentId)
                .associate { it[PaymentSplit.paymentId] to (it[splitSum] ?: BigDecimal.ZERO) }

            Payment
                .join(Contract, JoinType.LEFT, Payment.contractId, Contract.id)
                .join(Person, JoinType.LEFT, Contract.personId, Person.id)
                .join(Room, JoinType.LEFT, Contract.roomId, Room.id)
                .join(Apartment, JoinType.LEFT, Room.apartmentId, Apartment.id)
                .selectAll()
                .where { Payment.scopeDate eq month }
                .orderBy(sortColumn, sortOrderExpression)
                .map { row ->
                    PaymentHistoryWithPersonDTO(
                        id = row[Payment.id],
                        contractId = row[Payment.contractId],
                        scopeDate = row[Payment.scopeDate],
                        payedDate = row[Payment.payedDate]?.toString(),
                        amount = row[Payment.amount].toDouble(),
                        contractAmount = row[Contract.amount].toDouble(),
                        paidAmount = when (row[Payment.status]) {
                            PaymentStatus.PAID -> row[Payment.amount]
                            PaymentStatus.CANCELLED -> BigDecimal.ZERO
                            else -> splitTotals[row[Payment.id]] ?: BigDecimal.ZERO
                        }.toDouble(),
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

    suspend fun confirmPayment(paymentDto: PaymentConfirmationDTO): Unit = databaseProvider.dbQuery {
        val status = lockPayment(paymentDto.paymentId)[Payment.status]
        if (PaymentStatus.PENDING != status && PaymentStatus.LATE != status) {
            throw PaymentError.NotConfirmable(status)
        }
        Payment.update({ Payment.id eq paymentDto.paymentId }) {
            it[Payment.status] = PaymentStatus.PAID
            it[payedDate] = paymentDto.paymentDate.toLocalDateWithFullPattern()
            it[amount] = BigDecimal.valueOf(paymentDto.payedAmount)
        }
    }

    suspend fun splitPayment(paymentSplitDto: PaymentSplitDTO) = databaseProvider.dbQuery {
        val payment = lockPayment(paymentSplitDto.paymentId)

        val status = payment[Payment.status]
        if (PaymentStatus.PAID == status || PaymentStatus.CANCELLED == status) {
            throw PaymentError.NotSplittable(status)
        }

        val dueAmount = payment[Payment.amount]
        val alreadyPaid = paidInInstalments(paymentSplitDto.paymentId)

        val remaining = dueAmount - alreadyPaid
        if (BigDecimal.valueOf(paymentSplitDto.amount) > remaining) {
            throw PaymentError.Overpaid(remaining)
        }

        val paymentDate = paymentSplitDto.paymentDate.toLocalDateWithFullPattern()

        PaymentSplit.insert {
            it[PaymentSplit.paymentId] = paymentSplitDto.paymentId
            it[PaymentSplit.amount] = BigDecimal.valueOf(paymentSplitDto.amount)
            it[PaymentSplit.paymentDate] = paymentDate
        }

        val totalPaid = alreadyPaid + BigDecimal.valueOf(paymentSplitDto.amount)
        val isFullyPaid = totalPaid >= dueAmount

        Payment.update({ Payment.id eq paymentSplitDto.paymentId }) {
            it[Payment.status] = if (isFullyPaid) PaymentStatus.PAID else PaymentStatus.PARTIALLY_PAID
            it[Payment.payedDate] = paymentDate
        }
    }

    suspend fun getPaymentSplits(paymentId: Int): List<PaymentSplitEntryDTO> = databaseProvider.dbQuery {
        if (Payment.selectAll().where { Payment.id eq paymentId }.empty()) throw PaymentError.NotFound(paymentId)
        PaymentSplit.selectAll()
            .where { PaymentSplit.paymentId eq paymentId }
            .orderBy(PaymentSplit.paymentDate)
            .map { row ->
                PaymentSplitEntryDTO(
                    id = row[PaymentSplit.id],
                    paymentId = row[PaymentSplit.paymentId],
                    amount = row[PaymentSplit.amount].toDouble(),
                    paymentDate = row[PaymentSplit.paymentDate].toString()
                )
            }
    }

    /**
     * Marks PENDING payments as LATE once the contract's payment day of their month has passed.
     * A day beyond the month's length (e.g. 31 in February) means its last day.
     */
    suspend fun markLatePayments(today: LocalDate): Int = databaseProvider.dbQuery {
        val lateIds = Payment
            .join(Contract, JoinType.INNER, Payment.contractId, Contract.id)
            .select(Payment.id, Payment.scopeDate, Contract.payedTillDayOfMonth)
            .where { Payment.status eq PaymentStatus.PENDING }
            .filter { row ->
                val month = YearMonth.parse(row[Payment.scopeDate])
                val payDay = row[Contract.payedTillDayOfMonth].toInt().coerceAtMost(month.lengthOfMonth())
                today.isAfter(month.atDay(payDay))
            }
            .map { it[Payment.id] }
        if (lateIds.isEmpty()) return@dbQuery 0
        Payment.update({ (Payment.id inList lateIds) and (Payment.status eq PaymentStatus.PENDING) }) {
            it[status] = PaymentStatus.LATE
        }
    }

    private fun paidInInstalments(paymentId: Int): BigDecimal =
        PaymentSplit.select(PaymentSplit.amount).where { PaymentSplit.paymentId eq paymentId }
            .sumOf { it[PaymentSplit.amount] }

    private fun lockPayment(id: Int) =
        Payment.selectAll().where { Payment.id eq id }.forUpdate().singleOrNull() ?: throw PaymentError.NotFound(id)
}
