package pl.chodan.services

import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import org.slf4j.LoggerFactory
import pl.chodan.*
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.Payment
import pl.chodan.database.PaymentStatus
import java.math.BigDecimal
import kotlin.getValue

class PaymentService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()
    private val logger = LoggerFactory.getLogger(PaymentService::class.java)

    suspend fun createPayments(contract: RawContract, yearMonth: String) = databaseProvider.dbQuery {
        val paymentExists = checkIfPendingPaymentExistsForContract(contract.id, yearMonth)
        if (!paymentExists) {
            val paymentId = Payment.insert {
                it[contractId] = contract.id
                it[amount] = contract.amount?.toBigDecimal() ?: BigDecimal.ZERO
                it[payedDate] = null
                it[scopeDate] = yearMonth
                it[status] = PaymentStatus.PENDING
            } get Payment.id

            logger.info("✅ Utworzono nową płatność - ID: $paymentId, Kontrakt: ${contract.id}, Okres: $yearMonth, Kwota: ${contract.amount}")
        } else {
            logger.info("ℹ️ Płatność już istnieje dla kontraktu ${contract.id} w okresie $yearMonth - pomijam")
        }

    }

    private suspend fun checkIfPendingPaymentExistsForContract(contractId: Int, yearMonth: String): Boolean =
        databaseProvider.dbQuery {
            Payment.selectAll().where {
                (Payment.contractId eq contractId) and (Payment.scopeDate eq yearMonth)
            }.singleOrNull() != null
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

    suspend fun getPaymentsForMouth(mouth: String) = databaseProvider.dbQuery {
        //todo tutaj duzo zapytań bedzie leciało wiec pozniej refaktor tego
        val roomsAparts = RoomService().getRoomsWithAparts()
        Payment.selectAll().where { Payment.scopeDate eq mouth }.map { payments ->
            ContractService().getContractById(payments[Payment.contractId])?.let {
                val room = roomsAparts.find { room -> room.id == it.roomId }
                val person = PersonService().getPersonById(it.personId)?.let { person ->
                    PersonSmallDetailsDTO(
                        id = person.id, firstName = person.firstName, lastName = person.lastName
                    )
                }
                PaymentHistoryWithPersonDTO(
                    id = payments[Payment.id],
                    contractId = payments[Payment.contractId],
                    scopeDate = payments[Payment.scopeDate],
                    payedDate = payments[Payment.payedDate]?.toString() ?: null,
                    amount = payments[Payment.amount].toDouble(),
                    person = person,
                    room = room,
                    status = payments[Payment.status]
                )
            }
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