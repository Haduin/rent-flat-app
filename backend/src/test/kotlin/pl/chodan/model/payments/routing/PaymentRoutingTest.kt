package pl.chodan.model.payments.routing

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import org.koin.dsl.module
import pl.chodan.database.PaymentStatus
import pl.chodan.model.payments.dto.PaymentDTO
import pl.chodan.model.payments.dto.PaymentEdit
import pl.chodan.model.payments.dto.PaymentHistoryWithPersonDTO
import pl.chodan.model.payments.dto.PersonSmallDetailsDTO
import pl.chodan.model.payments.service.PaymentService
import pl.chodan.model.perons.dto.PaymentConfirmationDTO
import pl.chodan.model.room.dto.RoomWithApartmentDTO
import pl.chodan.routing.SortOrder
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.testAuthHeader
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class PaymentRoutingTest {

    private val paymentService = mockk<PaymentService>()

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module { single { paymentService } })
        application {
            installTestContentNegotiation()
            installTestAuthentication()
            configurePaymentRouting()
        }
    }

    @AfterTest
    fun tearDown() {
        stopTestKoin()
    }

    @Test
    fun `GET payments returns all payments`() = testApplication {
        setup()
        val payment = PaymentDTO(
            id = 1, contractId = 10, payedDate = null, scopeDate = "2026-08",
            amount = 2000.0, status = PaymentStatus.PENDING
        )
        coEvery { paymentService.getAllPayments() } returns listOf(payment)

        val response = client.get("/payments") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
    }

    @Test
    fun `GET payments without an authenticated user is rejected`() = testApplication {
        setup()

        val response = client.get("/payments")

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun `GET payments for month uses default sorting when not specified`() = testApplication {
        setup()
        val historyEntry = PaymentHistoryWithPersonDTO(
            id = 1, contractId = 10,
            person = PersonSmallDetailsDTO(id = 1, firstName = "Jan", lastName = "Kowalski"),
            room = RoomWithApartmentDTO(id = 5, number = "1", apartment = "Mieszkanie A"),
            payedDate = null, scopeDate = "2026-08", amount = 2000.0, status = PaymentStatus.PENDING
        )
        coEvery {
            paymentService.getPaymentsForMouth("2026-08", PaymentSortableField.ID, SortOrder.ASC)
        } returns listOf(historyEntry)

        val response = client.get("/payments/2026-08") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
        coVerify(exactly = 1) { paymentService.getPaymentsForMouth("2026-08", PaymentSortableField.ID, SortOrder.ASC) }
    }

    @Test
    fun `GET payments for month honours the requested sort field and order`() = testApplication {
        setup()
        coEvery {
            paymentService.getPaymentsForMouth("2026-08", PaymentSortableField.AMOUNT, SortOrder.DESC)
        } returns emptyList()

        val response = client.get("/payments/2026-08?sortField=AMOUNT&sortOrder=DESC") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        coVerify(exactly = 1) {
            paymentService.getPaymentsForMouth("2026-08", PaymentSortableField.AMOUNT, SortOrder.DESC)
        }
    }

    @Test
    fun `GET payments for month with an invalid sort field is not handled and results in a server error`() =
        testApplication {
            setup()

            val response = client.get("/payments/2026-08?sortField=NOT_A_FIELD") { testAuthHeader() }

            assertEquals(HttpStatusCode.InternalServerError, response.status)
        }

    // The confirm-payment handler instantiates `PaymentService()` directly instead of using the
    // Koin-injected instance, so the mocked service is never invoked. The freshly constructed
    // service fails to resolve its own dependencies from the test Koin module, which is caught by
    // the generic try/catch and surfaces as a 400 rather than the OK response the happy path implies.
    @Test
    fun `POST payments confirm ignores the injected mock and fails to resolve its own dependencies`() =
        testApplication {
            setup()
            val dto = PaymentConfirmationDTO(paymentId = 1, paymentDate = "2026-08-04", payedAmount = 2000.0)
            coEvery { paymentService.confirmPayment(dto) } returns 1

            val response = client.post("/payments/confirm") {
                testAuthHeader()
                contentType(ContentType.Application.Json)
                setBody(Json.encodeToString(PaymentConfirmationDTO.serializer(), dto))
            }

            assertEquals(HttpStatusCode.BadRequest, response.status)
            coVerify(exactly = 0) { paymentService.confirmPayment(any()) }
        }

    @Test
    fun `PUT payments edit updates a payment`() = testApplication {
        setup()
        val dto = PaymentEdit(paymentId = 1, amount = 2200.0, status = PaymentStatus.PAID, payedDate = "2026-08-04")
        coEvery { paymentService.editPayment(dto) } returns 1

        val response = client.put("/payments/edit") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(PaymentEdit.serializer(), dto))
        }

        assertEquals(HttpStatusCode.OK, response.status)
        coVerify(exactly = 1) { paymentService.editPayment(dto) }
    }

    @Test
    fun `PUT payments edit returns bad request when the service throws`() = testApplication {
        setup()
        val dto = PaymentEdit(paymentId = 1, amount = 2200.0, status = PaymentStatus.PAID, payedDate = "2026-08-04")
        coEvery { paymentService.editPayment(dto) } throws IllegalStateException("boom")

        val response = client.put("/payments/edit") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(PaymentEdit.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
    }
}
