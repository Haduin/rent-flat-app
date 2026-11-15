package pl.chodan.model.payments.service

import kotlinx.coroutines.runBlocking
import org.jetbrains.exposed.exceptions.ExposedSQLException
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pl.chodan.database.Payment
import pl.chodan.database.PaymentSplit
import pl.chodan.database.PaymentStatus
import pl.chodan.model.contract.database.Contract
import pl.chodan.model.contract.database.ContractStatus
import pl.chodan.model.contract.dto.NewContractDTO
import pl.chodan.model.contract.service.ContractService
import pl.chodan.model.payments.dto.PaymentEdit
import pl.chodan.model.payments.dto.PaymentSplitDTO
import pl.chodan.model.payments.routing.PaymentSortableField
import pl.chodan.model.persons.dto.CreatedPersonDTO
import pl.chodan.model.persons.dto.PaymentConfirmationDTO
import pl.chodan.model.persons.service.PersonService
import pl.chodan.routing.SortOrder
import pl.chodan.testutil.connectWithoutRetries
import pl.chodan.testutil.cleanTables
import pl.chodan.testutil.connectTestDatabase
import pl.chodan.testutil.insertApartment
import pl.chodan.testutil.insertPayment
import pl.chodan.testutil.insertPaymentSplit
import pl.chodan.testutil.insertRoom
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.assertApiError
import pl.chodan.testutil.runAgainstUncommittedCompetitor
import java.time.LocalDate

class PaymentServiceIntegrationTest {

    private val database = connectTestDatabase()

    @BeforeEach
    fun setUp() {
        database.cleanTables()
        startTestKoin(database)
    }

    @AfterEach
    fun tearDown() {
        stopTestKoin()
    }

    private suspend fun createContract(
        startDate: String = "2026-01-01",
        endDate: String = "2026-12-31",
        amount: Double = 2000.0
    ): Int {
        val personId = PersonService().createPerson(CreatedPersonDTO("Jan", "Kowalski", "ABC123", "PL"))
        val roomId = database.insertRoom(database.insertApartment())
        return ContractService().createContract(
            NewContractDTO(
                personId = personId, roomId = roomId, startDate = startDate, endDate = endDate,
                amount = amount, deposit = amount, payedDate = 10
            )
        )
    }

    @Test
    fun `generateNewPaymentsForActiveContracts creates a pending payment for an active contract`() = runBlocking {
        val contractId = createContract(startDate = "2026-01-01", endDate = "2026-12-31", amount = 1800.0)

        PaymentService().generateNewPaymentsForActiveContracts("2026-08")

        val payments = PaymentService().getAllPayments()
        assertEquals(1, payments.size)
        val payment = payments.single()
        assertEquals(contractId, payment.contractId)
        assertEquals("2026-08", payment.scopeDate)
        assertEquals(PaymentStatus.PENDING, payment.status)
        assertEquals(1800.0, payment.amount)
    }

    @Test
    fun `generateNewPaymentsForActiveContracts skips a contract outside the requested month`() = runBlocking {
        createContract(startDate = "2026-01-01", endDate = "2026-03-31")

        PaymentService().generateNewPaymentsForActiveContracts("2026-08")

        assertTrue(PaymentService().getAllPayments().isEmpty())
    }

    @Test
    fun `generateNewPaymentsForActiveContracts does not duplicate an already generated payment`() = runBlocking {
        val contractId = createContract()
        database.insertPayment(contractId, scopeDate = "2026-08")

        PaymentService().generateNewPaymentsForActiveContracts("2026-08")

        assertEquals(1, PaymentService().getAllPayments().size)
    }

    @Test
    fun `the database refuses a second payment for the same contract and month`() = runBlocking {
        val contractId = createContract()
        database.insertPayment(contractId, scopeDate = "2026-08")

        assertThrows(ExposedSQLException::class.java) {
            database.insertPayment(contractId, scopeDate = "2026-08")
        }
        assertEquals(1, PaymentService().getAllPayments().size)
    }

    @Test
    fun `editPayment only overwrites the provided fields`() = runBlocking {
        val contractId = createContract()
        val paymentId = database.insertPayment(contractId, scopeDate = "2026-08", amount = 1000.0)

        PaymentService().editPayment(PaymentEdit(paymentId = paymentId, amount = 1234.0, status = null, payedDate = null))

        val payment = PaymentService().getAllPayments().single { it.id == paymentId }
        assertEquals(1234.0, payment.amount)
        assertEquals(PaymentStatus.PENDING, payment.status)
    }

    @Test
    fun `getPaymentsForMonth only returns payments scoped to the requested month`() = runBlocking {
        val contractId = createContract()
        database.insertPayment(contractId, scopeDate = "2026-07")
        database.insertPayment(contractId, scopeDate = "2026-08")

        val payments = PaymentService().getPaymentsForMonth("2026-08")

        assertEquals(1, payments.size)
        assertEquals("2026-08", payments.single().scopeDate)
    }

    @Test
    fun `getPaymentsForMonth reports the paid amount per status`() = runBlocking {
        val partial = database.insertPayment(createContract(), "2026-08", amount = 1600.0, status = PaymentStatus.PARTIALLY_PAID)
        database.insertPaymentSplit(partial, 300.0, "2026-08-02")
        database.insertPaymentSplit(partial, 200.0, "2026-08-09")
        val paid = database.insertPayment(createContract(), "2026-08", amount = 2000.0, status = PaymentStatus.PAID, payedDate = "2026-08-05")
        val pending = database.insertPayment(createContract(), "2026-08", amount = 1000.0)

        val paidAmounts = PaymentService().getPaymentsForMonth("2026-08").associate { it.id to it.paidAmount }

        assertEquals(mapOf(partial to 500.0, paid to 2000.0, pending to 0.0), paidAmounts)
    }

    @Test
    fun `getPaymentsForMonth sorts by amount descending when requested`() = runBlocking {
        // one payment per contract per month, so each amount needs its own contract
        database.insertPayment(createContract(), scopeDate = "2026-08", amount = 100.0)
        database.insertPayment(createContract(), scopeDate = "2026-08", amount = 300.0)
        database.insertPayment(createContract(), scopeDate = "2026-08", amount = 200.0)

        val payments = PaymentService().getPaymentsForMonth(
            "2026-08", sortFieldName = PaymentSortableField.AMOUNT, sortOrder = SortOrder.DESC
        )

        assertEquals(listOf(300.0, 200.0, 100.0), payments.map { it.amount })
    }

    @Test
    fun `getPaymentsForMonth returns the whole month without paging (D8)`() = runBlocking {
        repeat(21) { database.insertPayment(createContract(), scopeDate = "2026-08") }

        assertEquals(21, PaymentService().getPaymentsForMonth("2026-08").size)
    }

    @Test
    fun `confirmPayment marks the payment as PAID with the confirmed amount`() = runBlocking {
        val contractId = createContract()
        val paymentId = database.insertPayment(contractId, scopeDate = "2026-08", amount = 1800.0)

        PaymentService().confirmPayment(
            PaymentConfirmationDTO(paymentId = paymentId, paymentDate = "2026-08-10", payedAmount = 1800.0)
        )

        val payment = PaymentService().getAllPayments().single { it.id == paymentId }
        assertEquals(PaymentStatus.PAID, payment.status)
        assertEquals("2026-08-10", payment.payedDate)
    }

    @Test
    fun `splitPayment marks the payment PARTIALLY_PAID when the instalment doesn't cover the due amount`() = runBlocking {
        val contractId = createContract()
        val paymentId = database.insertPayment(contractId, scopeDate = "2026-08", amount = 1000.0)

        PaymentService().splitPayment(
            PaymentSplitDTO(paymentId = paymentId, amount = 800.0, paymentDate = "2026-08-08")
        )

        val payment = PaymentService().getAllPayments().single { it.id == paymentId }
        assertEquals(PaymentStatus.PARTIALLY_PAID, payment.status)
        assertEquals("2026-08-08", payment.payedDate)
        assertEquals(1000.0, payment.amount)
    }

    @Test
    fun `splitPayment marks the payment PAID once instalments cover the full due amount`() = runBlocking {
        val contractId = createContract()
        val paymentId = database.insertPayment(contractId, scopeDate = "2026-08", amount = 1000.0)
        database.insertPaymentSplit(paymentId, amount = 800.0, paymentDate = "2026-08-08")

        PaymentService().splitPayment(
            PaymentSplitDTO(paymentId = paymentId, amount = 200.0, paymentDate = "2026-08-20")
        )

        val payment = PaymentService().getAllPayments().single { it.id == paymentId }
        assertEquals(PaymentStatus.PAID, payment.status)
        assertEquals("2026-08-20", payment.payedDate)
    }

    @Test
    fun `splitPayment rejects an instalment larger than the remaining balance`() = runBlocking {
        val contractId = createContract()
        val paymentId = database.insertPayment(contractId, scopeDate = "2026-08", amount = 1000.0)
        database.insertPaymentSplit(paymentId, amount = 800.0, paymentDate = "2026-08-08")

        assertApiError("PAYMENT_OVERPAID") {
            PaymentService().splitPayment(
                PaymentSplitDTO(paymentId = paymentId, amount = 300.0, paymentDate = "2026-08-20")
            )
        }
    }

    @Test
    fun `confirmPayment and splitPayment throw PAYMENT_NOT_FOUND for a missing payment`() {
        assertApiError("PAYMENT_NOT_FOUND") {
            PaymentService().confirmPayment(
                PaymentConfirmationDTO(paymentId = 12345, paymentDate = "2026-08-10", payedAmount = 100.0)
            )
        }
        assertApiError("PAYMENT_NOT_FOUND") {
            PaymentService().splitPayment(PaymentSplitDTO(paymentId = 12345, amount = 100.0, paymentDate = "2026-08-20"))
        }
    }

    @Test
    fun `getPaymentSplits throws PAYMENT_NOT_FOUND for a missing payment (D7)`() {
        assertApiError("PAYMENT_NOT_FOUND") { PaymentService().getPaymentSplits(999) }
    }

    @Test
    fun `splitPayment rejects splitting an already paid payment`() = runBlocking {
        val contractId = createContract()
        val paymentId = database.insertPayment(
            contractId, scopeDate = "2026-08", amount = 1000.0, status = PaymentStatus.PAID
        )

        assertApiError("PAYMENT_NOT_SPLITTABLE") {
            PaymentService().splitPayment(
                PaymentSplitDTO(paymentId = paymentId, amount = 100.0, paymentDate = "2026-08-20")
            )
        }
    }

    @Test
    fun `getPaymentSplits returns the recorded instalments ordered by payment date`() = runBlocking {
        val contractId = createContract()
        val paymentId = database.insertPayment(contractId, scopeDate = "2026-08", amount = 1000.0)
        database.insertPaymentSplit(paymentId, amount = 200.0, paymentDate = "2026-08-20")
        database.insertPaymentSplit(paymentId, amount = 800.0, paymentDate = "2026-08-08")

        val splits = PaymentService().getPaymentSplits(paymentId)

        assertEquals(listOf(800.0, 200.0), splits.map { it.amount })
        assertEquals(listOf("2026-08-08", "2026-08-20"), splits.map { it.paymentDate })
    }

    @Test
    fun `confirmPayment rejects an already paid payment with PAYMENT_NOT_CONFIRMABLE`() = runBlocking {
        val paymentId = database.insertPayment(createContract(), "2026-08", status = PaymentStatus.PAID, payedDate = "2026-08-05")

        assertApiError("PAYMENT_NOT_CONFIRMABLE") {
            PaymentService().confirmPayment(PaymentConfirmationDTO(paymentId, "2026-08-10", 2000.0))
        }
    }

    @Test
    fun `confirmPayment rejects a partially paid payment with PAYMENT_NOT_CONFIRMABLE`() = runBlocking {
        val paymentId = database.insertPayment(createContract(), "2026-08", amount = 2000.0, status = PaymentStatus.PARTIALLY_PAID)
        database.insertPaymentSplit(paymentId, 800.0, "2026-08-05")

        assertApiError("PAYMENT_NOT_CONFIRMABLE") {
            PaymentService().confirmPayment(PaymentConfirmationDTO(paymentId, "2026-08-10", 1200.0))
        }
    }

    @Test
    fun `splitPayment rejects an overpaying instalment with PAYMENT_OVERPAID`() = runBlocking {
        val paymentId = database.insertPayment(createContract(), "2026-08", amount = 2000.0)

        assertApiError("PAYMENT_OVERPAID") {
            PaymentService().splitPayment(PaymentSplitDTO(paymentId, 2500.0, "2026-08-10"))
        }
    }

    @Test
    fun `generateNewPaymentsForActiveContracts waits for an uncommitted payment of the same month and skips it (D11)`() = runBlocking {
        val contractId = createContract()
        // Exposed retries a transaction after an SQL error, which would hide the unique violation on retry.
        stopTestKoin()
        startTestKoin(connectWithoutRetries())

        val result = runAgainstUncommittedCompetitor(
            database,
            competitor = {
                Payment.insert {
                    it[Payment.contractId] = contractId
                    it[scopeDate] = "2026-08"
                    it[amount] = 2000.toBigDecimal()
                    it[status] = PaymentStatus.PENDING
                }
            },
            service = { PaymentService().generateNewPaymentsForActiveContracts("2026-08") },
        )

        assertTrue(result.isSuccess, "$result")
        assertEquals(1, PaymentService().getAllPayments().size)
    }

    @Test
    fun `generateNewPaymentsForActiveContracts waits for an uncommitted termination and skips the contract`() = runBlocking {
        val contractId = createContract()

        val result = runAgainstUncommittedCompetitor(
            database,
            competitor = {
                Contract.selectAll().where { Contract.id eq contractId }.forUpdate().single()
                Contract.update({ Contract.id eq contractId }) { it[status] = ContractStatus.TERMINATED }
            },
            service = { PaymentService().generateNewPaymentsForActiveContracts("2026-08") },
        )

        assertTrue(result.isSuccess, "$result")
        assertTrue(PaymentService().getAllPayments().isEmpty())
    }

    @Test
    fun `splitPayment waits for an uncommitted instalment and then refuses with PAYMENT_OVERPAID (D13)`() = runBlocking {
        val paymentId = database.insertPayment(createContract(), "2026-08", amount = 1000.0)
        stopTestKoin()
        startTestKoin(connectWithoutRetries())

        val result = runAgainstUncommittedCompetitor(
            database,
            competitor = {
                Payment.selectAll().where { Payment.id eq paymentId }.forUpdate().toList()
                PaymentSplit.insert {
                    it[PaymentSplit.paymentId] = paymentId
                    it[amount] = 600.toBigDecimal()
                    it[paymentDate] = LocalDate.of(2026, 8, 5)
                }
            },
            service = { PaymentService().splitPayment(PaymentSplitDTO(paymentId, 600.0, "2026-08-10")) },
        )

        assertEquals("PAYMENT_OVERPAID", (result.exceptionOrNull() as? PaymentError)?.code?.name, "$result")
    }
}
