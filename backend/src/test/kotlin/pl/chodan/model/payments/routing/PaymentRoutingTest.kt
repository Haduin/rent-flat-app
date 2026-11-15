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
import pl.chodan.error.ApiError
import pl.chodan.error.ErrorCode
import pl.chodan.model.payments.dto.PaymentDTO
import pl.chodan.model.payments.dto.PaymentEdit
import pl.chodan.model.payments.dto.PaymentHistoryWithPersonDTO
import pl.chodan.model.payments.dto.PaymentSplitDTO
import pl.chodan.model.payments.dto.PaymentSplitEntryDTO
import pl.chodan.model.payments.dto.PersonSmallDetailsDTO
import pl.chodan.model.payments.service.PaymentError
import pl.chodan.model.payments.service.PaymentService
import pl.chodan.model.persons.dto.PaymentConfirmationDTO
import pl.chodan.model.room.dto.RoomWithApartmentDTO
import pl.chodan.routing.SortOrder
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.installTestErrorHandling
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
            installTestErrorHandling()
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
            payedDate = null, scopeDate = "2026-08", amount = 2000.0, paidAmount = 0.0, status = PaymentStatus.PENDING
        )
        coEvery {
            paymentService.getPaymentsForMonth("2026-08", PaymentSortableField.ID, SortOrder.ASC)
        } returns listOf(historyEntry)

        val response = client.get("/payments/2026-08") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
        coVerify(exactly = 1) { paymentService.getPaymentsForMonth("2026-08", PaymentSortableField.ID, SortOrder.ASC) }
    }

    @Test
    fun `GET payments for month honours the requested sort field and order`() = testApplication {
        setup()
        coEvery {
            paymentService.getPaymentsForMonth("2026-08", PaymentSortableField.AMOUNT, SortOrder.DESC)
        } returns emptyList()

        val response = client.get("/payments/2026-08?sortField=AMOUNT&sortOrder=DESC") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        coVerify(exactly = 1) {
            paymentService.getPaymentsForMonth("2026-08", PaymentSortableField.AMOUNT, SortOrder.DESC)
        }
    }

    @Test
    fun `GET payments for month with an invalid sort field returns bad request`() = testApplication {
        setup()

        val response = client.get("/payments/2026-08?sortField=NOT_A_FIELD") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(ErrorCode.VALIDATION_FAILED, Json.decodeFromString<ApiError>(response.bodyAsText()).code)
        coVerify(exactly = 0) { paymentService.getPaymentsForMonth(any(), any(), any()) }
    }

    @Test
    fun `GET payments for month with a malformed month returns bad request`() = testApplication {
        setup()

        val response = client.get("/payments/August") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(ErrorCode.VALIDATION_FAILED, Json.decodeFromString<ApiError>(response.bodyAsText()).code)
        coVerify(exactly = 0) { paymentService.getPaymentsForMonth(any(), any(), any()) }
    }

    @Test
    fun `GET payments for month with an invalid sort order returns bad request`() = testApplication {
        setup()

        val response = client.get("/payments/2026-08?sortOrder=NOT_AN_ORDER") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { paymentService.getPaymentsForMonth(any(), any(), any()) }
    }

    @Test
    fun `POST payments confirm confirms a payment`() = testApplication {
        setup()
        val dto = PaymentConfirmationDTO(paymentId = 1, paymentDate = "2026-08-04", payedAmount = 2000.0)
        coEvery { paymentService.confirmPayment(dto) } returns Unit

        val response = client.post("/payments/confirm") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(PaymentConfirmationDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { paymentService.confirmPayment(dto) }
    }

    @Test
    fun `PUT payments edit updates a payment`() = testApplication {
        setup()
        val dto = PaymentEdit(paymentId = 1, amount = 2200.0, status = PaymentStatus.PAID, payedDate = "2026-08-04")
        coEvery { paymentService.editPayment(dto) } returns Unit

        val response = client.put("/payments/edit") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(PaymentEdit.serializer(), dto))
        }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { paymentService.editPayment(dto) }
    }

    @Test
    fun `POST payments split records a split payment`() = testApplication {
        setup()
        val dto = PaymentSplitDTO(paymentId = 1, amount = 800.0, paymentDate = "2026-08-08")
        coEvery { paymentService.splitPayment(dto) } returns 1

        val response = client.post("/payments/split") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(PaymentSplitDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { paymentService.splitPayment(dto) }
    }

    @Test
    fun `POST payments split with a non positive amount returns validation details`() = testApplication {
        setup()
        val dto = PaymentSplitDTO(paymentId = 1, amount = 0.0, paymentDate = "2026-08-08")

        val response = client.post("/payments/split") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(PaymentSplitDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val error = Json.decodeFromString<ApiError>(response.bodyAsText())
        assertEquals(listOf("amount: kwota wpłaty musi być większa od 0"), error.details)
        coVerify(exactly = 0) { paymentService.splitPayment(any()) }
    }

    @Test
    fun `GET payments splits returns the recorded instalments`() = testApplication {
        setup()
        val split = PaymentSplitEntryDTO(id = 1, paymentId = 1, amount = 800.0, paymentDate = "2026-08-08")
        coEvery { paymentService.getPaymentSplits(1) } returns listOf(split)

        val response = client.get("/payments/1/splits") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
        coVerify(exactly = 1) { paymentService.getPaymentSplits(1) }
    }

    @Test
    fun `PUT payments edit without any field to change returns bad request`() = testApplication {
        setup()
        val dto = PaymentEdit(paymentId = 1, amount = null, status = null, payedDate = null)

        val response = client.put("/payments/edit") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(PaymentEdit.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val error = Json.decodeFromString<ApiError>(response.bodyAsText())
        assertEquals(ErrorCode.VALIDATION_FAILED, error.code)
        assertEquals(listOf("Podaj co najmniej jedno pole do zmiany"), error.details)
        coVerify(exactly = 0) { paymentService.editPayment(any()) }
    }

    @Test
    fun `domain errors of each endpoint map to their status and code`() = testApplication {
        setup()
        coEvery { paymentService.editPayment(match { 99 == it.paymentId }) } throws PaymentError.NotFound(99)
        coEvery { paymentService.confirmPayment(match { 99 == it.paymentId }) } throws PaymentError.NotFound(99)
        coEvery { paymentService.confirmPayment(match { 8 == it.paymentId }) } throws
                PaymentError.NotConfirmable(PaymentStatus.PAID)
        coEvery { paymentService.splitPayment(match { 99 == it.paymentId }) } throws PaymentError.NotFound(99)
        coEvery { paymentService.splitPayment(match { 8 == it.paymentId }) } throws
                PaymentError.NotSplittable(PaymentStatus.CANCELLED)
        coEvery { paymentService.splitPayment(match { 7 == it.paymentId }) } throws
                PaymentError.Overpaid(100.toBigDecimal())
        coEvery { paymentService.getPaymentSplits(99) } throws PaymentError.NotFound(99)

        fun edit(id: Int) = Json.encodeToString(PaymentEdit.serializer(), PaymentEdit(id, 100.0, null, null))
        fun confirm(id: Int) = Json.encodeToString(PaymentConfirmationDTO.serializer(), PaymentConfirmationDTO(id, "2026-08-04", 100.0))
        fun split(id: Int) = Json.encodeToString(PaymentSplitDTO.serializer(), PaymentSplitDTO(id, 100.0, "2026-08-08"))
        data class Case(val method: HttpMethod, val path: String, val body: String?, val code: ErrorCode)
        val cases = listOf(
            Case(HttpMethod.Put, "/payments/edit", edit(99), ErrorCode.PAYMENT_NOT_FOUND),
            Case(HttpMethod.Post, "/payments/confirm", confirm(99), ErrorCode.PAYMENT_NOT_FOUND),
            Case(HttpMethod.Post, "/payments/confirm", confirm(8), ErrorCode.PAYMENT_NOT_CONFIRMABLE),
            Case(HttpMethod.Post, "/payments/split", split(99), ErrorCode.PAYMENT_NOT_FOUND),
            Case(HttpMethod.Post, "/payments/split", split(8), ErrorCode.PAYMENT_NOT_SPLITTABLE),
            Case(HttpMethod.Post, "/payments/split", split(7), ErrorCode.PAYMENT_OVERPAID),
            Case(HttpMethod.Get, "/payments/99/splits", null, ErrorCode.PAYMENT_NOT_FOUND),
        )

        for ((method, path, body, code) in cases) {
            val response = client.request(path) {
                this.method = method
                testAuthHeader()
                if (null != body) {
                    contentType(ContentType.Application.Json)
                    setBody(body)
                }
            }
            assertEquals(code.status, response.status, "$method $path $body")
            assertEquals(code, Json.decodeFromString<ApiError>(response.bodyAsText()).code, "$method $path $body")
        }
    }
}
