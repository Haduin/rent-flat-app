package pl.chodan.services

import org.jetbrains.exposed.sql.*
import pl.chodan.*
import pl.chodan.commons.toFormattedString
import pl.chodan.commons.toLocalDateWithFullPattern
import java.math.BigDecimal
import java.time.LocalDate

class PaymentService {

    suspend fun createPayments(contract: RawContract) = dbQuery {
        checkIfPendingPaymentExistsForContract(contract.id)
            .takeUnless { it }?.let {
                Payment.insert {
                    it[contractId] = contract.id
                    it[amount] = contract.amount?.toBigDecimal() ?: BigDecimal.ZERO
                    it[payedDate] = null
                    it[scopeDate] = LocalDate.now().toFormattedString()
                    it[status] = PaymentStatus.PENDING
                }
            }
    }

    private suspend fun checkIfPendingPaymentExistsForContract(contractId: Int) = dbQuery {
        Payment.selectAll()
            .where {
                (Payment.contractId eq contractId) and
                        ((Payment.status eq PaymentStatus.PENDING) or (Payment.status eq PaymentStatus.PAID))
            }
            .singleOrNull() != null


    }

    suspend fun getAllPayments(): List<PaymentDTO> = dbQuery {
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

    suspend fun getPaymentsForMouth(mouth: String) = dbQuery {
        //todo tutaj duzo zapytań bedzie leciało wiec pozniej refaktor tego
        val roomsAparts = RoomService().getRoomsWithAparts()
        Payment.selectAll()
            .where { Payment.scopeDate eq mouth }
            .map { payments ->
                ContractService().getContractById(payments[Payment.contractId])?.let {
                    val room = roomsAparts.find { room -> room.id == it.roomId }
                    val person = PersonService().getPersonById(it.personId)?.let { person ->
                        PersonSmallDetailsDTO(
                            id = person.id,
                            firstName = person.firstName,
                            lastName = person.lastName
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

    suspend fun confirmPayment(paymentDto: PaymentConfirmationDTO) = dbQuery {
        Payment.update({ Payment.id eq paymentDto.paymentId }) {
            it[status] = PaymentStatus.PAID
            it[payedDate] = paymentDto.paymentDate.toLocalDateWithFullPattern()
            it[amount] = BigDecimal.valueOf(paymentDto.payedAmount)
        }
    }
}