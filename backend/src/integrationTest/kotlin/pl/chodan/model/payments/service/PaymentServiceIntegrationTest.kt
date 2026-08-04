package pl.chodan.model.payments.service

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pl.chodan.database.PaymentStatus
import pl.chodan.model.contract.dto.NewContractDTO
import pl.chodan.model.contract.service.ContractService
import pl.chodan.model.payments.dto.PaymentEdit
import pl.chodan.model.payments.routing.PaymentSortableField
import pl.chodan.model.perons.dto.CreatedPersonDTO
import pl.chodan.model.perons.dto.PaymentConfirmationDTO
import pl.chodan.model.perons.service.PersonService
import pl.chodan.routing.SortOrder
import pl.chodan.testutil.cleanTables
import pl.chodan.testutil.connectTestDatabase
import pl.chodan.testutil.insertApartment
import pl.chodan.testutil.insertPayment
import pl.chodan.testutil.insertRoom
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin

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
    fun `editPayment only overwrites the provided fields`() = runBlocking {
        val contractId = createContract()
        val paymentId = database.insertPayment(contractId, scopeDate = "2026-08", amount = 1000.0)

        PaymentService().editPayment(PaymentEdit(paymentId = paymentId, amount = 1234.0, status = null, payedDate = null))

        val payment = PaymentService().getAllPayments().single { it.id == paymentId }
        assertEquals(1234.0, payment.amount)
        assertEquals(PaymentStatus.PENDING, payment.status)
    }

    @Test
    fun `getPaymentsForMouth only returns payments scoped to the requested month`() = runBlocking {
        val contractId = createContract()
        database.insertPayment(contractId, scopeDate = "2026-07")
        database.insertPayment(contractId, scopeDate = "2026-08")

        val payments = PaymentService().getPaymentsForMouth("2026-08")

        assertEquals(1, payments.size)
        assertEquals("2026-08", payments.single().scopeDate)
    }

    @Test
    fun `getPaymentsForMouth sorts by amount descending when requested`() = runBlocking {
        val contractId = createContract()
        database.insertPayment(contractId, scopeDate = "2026-08", amount = 100.0)
        database.insertPayment(contractId, scopeDate = "2026-08", amount = 300.0)
        database.insertPayment(contractId, scopeDate = "2026-08", amount = 200.0)

        val payments = PaymentService().getPaymentsForMouth(
            "2026-08", sortFieldName = PaymentSortableField.AMOUNT, sortOrder = SortOrder.DESC
        )

        assertEquals(listOf(300.0, 200.0, 100.0), payments.map { it.amount })
    }

    @Test
    fun `getPaymentsForMouth paginates results`() = runBlocking {
        val contractId = createContract()
        repeat(3) { database.insertPayment(contractId, scopeDate = "2026-08", amount = it.toDouble()) }

        val firstPage = PaymentService().getPaymentsForMouth("2026-08", page = 0, pageSize = 2)
        val secondPage = PaymentService().getPaymentsForMouth("2026-08", page = 1, pageSize = 2)

        assertEquals(2, firstPage.size)
        assertEquals(1, secondPage.size)
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

    // Despite the name, deletePayment never removes the row - it behaves exactly like
    // confirmPayment except for the resulting status. This documents the actual behaviour rather
    // than the name's implication.
    @Test
    fun `deletePayment cancels the payment instead of removing the row`() = runBlocking {
        val contractId = createContract()
        val paymentId = database.insertPayment(contractId, scopeDate = "2026-08", amount = 1800.0)

        PaymentService().deletePayment(
            PaymentConfirmationDTO(paymentId = paymentId, paymentDate = "2026-08-10", payedAmount = 1800.0)
        )

        val payments = PaymentService().getAllPayments()
        assertEquals(1, payments.size)
        assertEquals(PaymentStatus.CANCELLED, payments.single().status)
    }
}
