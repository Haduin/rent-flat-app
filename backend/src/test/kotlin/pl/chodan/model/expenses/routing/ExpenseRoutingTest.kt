package pl.chodan.model.expenses.routing

import io.ktor.client.HttpClient
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.koin.dsl.module
import pl.chodan.database.ExpenseCategory
import pl.chodan.database.PaymentStatus
import pl.chodan.error.ApiError
import pl.chodan.error.ErrorCode
import pl.chodan.model.apartment.dto.ApartmentResponse
import pl.chodan.model.apartment.dto.RoomDetails
import pl.chodan.model.expenses.dto.ExpenseConfirmationDTO
import pl.chodan.model.expenses.dto.NewOperationalExpenseDTO
import pl.chodan.model.expenses.dto.OperationalExpenseDTO
import pl.chodan.model.expenses.dto.UpdateOperationalExpenseDTO
import pl.chodan.model.apartment.service.ApartmentError
import pl.chodan.model.expenses.service.ExpenseError
import pl.chodan.model.expenses.service.ExpenseService
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.installTestErrorHandling
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.testAuthHeader
import pl.chodan.ultis.YearMonthString
import java.time.YearMonth
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class ExpenseRoutingTest {

    private val expenseService = mockk<ExpenseService>()

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module { single { expenseService } })
        application {
            installTestContentNegotiation()
            installTestErrorHandling()
            installTestAuthentication()
            configureExpenseRouting()
        }
    }

    @AfterTest
    fun tearDown() {
        stopTestKoin()
    }

    @Test
    fun `GET expenses returns expenses for the given filters`() = testApplication {
        setup()
        val expense = OperationalExpenseDTO(
            id = 1,
            apartmentDetails = ApartmentResponse(id = 10, name = "Mieszkanie A"),
            roomDetails = RoomDetails(roomId = 20, roomName = "Pokój 1", apartmentId = 10),
            insertDate = "2026-08-01",
            costDate = null,
            paidDate = null,
            amount = 150.0,
            category = ExpenseCategory.UTILITY_ELECTRICITY,
            status = PaymentStatus.PENDING,
            description = "Prąd",
            invoiceNumber = null,
            templateId = null
        )
        coEvery { expenseService.getExpenses(YearMonthString.parse("2026-08"), 10, 20) } returns listOf(expense)

        val response = client.get("/expenses?yearMonth=2026-08&apartmentId=10&roomId=20") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
        assertEquals(1, body[0].jsonObject["id"]!!.jsonPrimitive.int)
        coVerify(exactly = 1) { expenseService.getExpenses(YearMonthString.parse("2026-08"), 10, 20) }
    }

    @Test
    fun `GET expenses without optional filters passes null ids to the service`() = testApplication {
        setup()
        coEvery { expenseService.getExpenses(YearMonthString.parse("2026-08"), null, null) } returns emptyList()

        val response = client.get("/expenses?yearMonth=2026-08") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("[]", response.bodyAsText())
    }

    @Test
    fun `GET expenses without an authenticated user is rejected`() = testApplication {
        setup()

        val response = client.get("/expenses?yearMonth=2026-08")

        assertEquals(HttpStatusCode.Unauthorized, response.status)
        coVerify(exactly = 0) { expenseService.getExpenses(any(), any(), any()) }
    }

    @Test
    fun `POST expenses confirm confirms an expense`() = testApplication {
        setup()
        val dto = ExpenseConfirmationDTO(expenseId = 1, paidDate = "2026-08-04", payedAmount = 150.0)
        coEvery { expenseService.confirmExpense(dto) } returns Unit

        val response = client.post("/expenses/confirm") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(ExpenseConfirmationDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { expenseService.confirmExpense(dto) }
    }

    @Test
    fun `POST expenses confirm with a non positive amount returns validation details`() = testApplication {
        setup()
        val dto = ExpenseConfirmationDTO(expenseId = 1, paidDate = "2026-08-04", payedAmount = 0.0)

        val response = client.post("/expenses/confirm") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(ExpenseConfirmationDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val error = Json.decodeFromString<ApiError>(response.bodyAsText())
        assertEquals(listOf("payedAmount: kwota musi być większa od 0"), error.details)
        coVerify(exactly = 0) { expenseService.confirmExpense(any()) }
    }

    @Test
    fun `POST expenses creates an expense and returns its id`() = testApplication {
        setup()
        val dto = NewOperationalExpenseDTO(
            apartmentId = 10,
            roomId = 20,
            insertDate = "2026-08-01",
            costDate = null,
            amount = 99.5,
            category = ExpenseCategory.UTILITY_GAS,
            description = "Gaz",
            invoiceNumber = "F/123"
        )
        coEvery { expenseService.addExpense(dto) } returns 42

        val response = client.post("/expenses") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(NewOperationalExpenseDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.Created, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals(42, body["id"]!!.jsonPrimitive.int)
    }

    @Test
    fun `POST expenses with an invalid date returns validation details`() = testApplication {
        setup()
        val dto = NewOperationalExpenseDTO(
            apartmentId = 10,
            roomId = 20,
            insertDate = "01-08-2026",
            costDate = null,
            amount = 99.5,
            category = ExpenseCategory.UTILITY_GAS,
            description = "Gaz",
            invoiceNumber = "F/123"
        )

        val response = client.post("/expenses") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(NewOperationalExpenseDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val error = Json.decodeFromString<ApiError>(response.bodyAsText())
        assertEquals(listOf("insertDate: wymagany format yyyy-MM-dd"), error.details)
        coVerify(exactly = 0) { expenseService.addExpense(any()) }
    }

    @Test
    fun `PUT expenses updates an expense`() = testApplication {
        setup()
        val dto = UpdateOperationalExpenseDTO(
            id = 5,
            insertDate = null,
            costDate = null,
            amount = 20.0,
            category = null,
            description = null,
            invoiceNumber = null
        )
        coEvery { expenseService.updateExpense(dto) } returns Unit

        val response = client.put("/expenses") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdateOperationalExpenseDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { expenseService.updateExpense(dto) }
    }

    @Test
    fun `POST expenses generate triggers generation for the given month`() = testApplication {
        setup()
        coEvery { expenseService.generateMonthlyExpenses("2026-08") } returns Unit

        val response = client.post("/expenses/generate?yearMonth=2026-08") { testAuthHeader() }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { expenseService.generateMonthlyExpenses("2026-08") }
    }

    @Test
    fun `POST expenses generate without yearMonth returns bad request`() = testApplication {
        setup()

        val response = client.post("/expenses/generate") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(ErrorCode.VALIDATION_FAILED, Json.decodeFromString<ApiError>(response.bodyAsText()).code)
        coVerify(exactly = 0) { expenseService.generateMonthlyExpenses(any()) }
    }

    @Test
    fun `DELETE expenses removes an expense`() = testApplication {
        setup()
        coEvery { expenseService.deleteExpense(7) } returns Unit

        val response = client.delete("/expenses/7") { testAuthHeader() }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { expenseService.deleteExpense(7) }
    }

    @Test
    fun `DELETE expenses with a non numeric id returns bad request`() = testApplication {
        setup()

        val response = client.delete("/expenses/abc") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { expenseService.deleteExpense(any()) }
    }


    @Test
    fun `PUT expenses with no fields returns validation error`() = testApplication {
        setup()
        val dto = UpdateOperationalExpenseDTO(
            id = 5, insertDate = null, costDate = null, amount = null, category = null, description = null, invoiceNumber = null
        )

        val response = client.putJson(dto)

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val error = Json.decodeFromString<ApiError>(response.bodyAsText())
        assertEquals(ErrorCode.VALIDATION_FAILED, error.code)
        assertEquals(listOf("Podaj co najmniej jedno pole do zmiany"), error.details)
        coVerify(exactly = 0) { expenseService.updateExpense(any()) }
    }

    @Test
    fun `domain errors of each endpoint map to their status and code`() = testApplication {
        setup()
        val create = NewOperationalExpenseDTO(
            apartmentId = 10, roomId = null, insertDate = "2026-08-01", costDate = null, amount = 99.5,
            category = ExpenseCategory.UTILITY_GAS, description = null, invoiceNumber = null
        )
        val update = UpdateOperationalExpenseDTO(
            id = 1, insertDate = null, costDate = null, amount = 20.0, category = null, description = null, invoiceNumber = null
        )
        val confirm = ExpenseConfirmationDTO(expenseId = 1, paidDate = "2026-08-04", payedAmount = 150.0)
        val august = YearMonth.of(2026, 8)
        coEvery { expenseService.addExpense(create) } throws ApartmentError.NotFound(10)
        coEvery { expenseService.addExpense(create.copy(roomId = 20)) } throws ApartmentError.RoomNotFound(20)
        coEvery { expenseService.addExpense(create.copy(templateId = 3)) } throws ExpenseError.TemplateNotFound(3)
        coEvery { expenseService.addExpense(create.copy(templateId = 4)) } throws ExpenseError.AlreadyGenerated(august)
        coEvery { expenseService.updateExpense(update) } throws ExpenseError.NotFound(1)
        coEvery { expenseService.updateExpense(update.copy(id = 2)) } throws ExpenseError.AlreadyGenerated(august)
        coEvery { expenseService.confirmExpense(confirm) } throws ExpenseError.NotFound(1)
        coEvery { expenseService.confirmExpense(confirm.copy(expenseId = 2)) } throws
                ExpenseError.NotConfirmable(PaymentStatus.PAID)
        coEvery { expenseService.deleteExpense(1) } throws ExpenseError.NotFound(1)
        val cases = listOf(
            Triple(client.postJson("/expenses", create), "POST apartment", ErrorCode.APARTMENT_NOT_FOUND),
            Triple(client.postJson("/expenses", create.copy(roomId = 20)), "POST room", ErrorCode.ROOM_NOT_FOUND),
            Triple(client.postJson("/expenses", create.copy(templateId = 3)), "POST template", ErrorCode.EXPENSE_TEMPLATE_NOT_FOUND),
            Triple(client.postJson("/expenses", create.copy(templateId = 4)), "POST generated", ErrorCode.EXPENSE_ALREADY_GENERATED),
            Triple(client.putJson(update), "PUT not found", ErrorCode.EXPENSE_NOT_FOUND),
            Triple(client.putJson(update.copy(id = 2)), "PUT generated", ErrorCode.EXPENSE_ALREADY_GENERATED),
            Triple(client.postJson("/expenses/confirm", confirm), "confirm not found", ErrorCode.EXPENSE_NOT_FOUND),
            Triple(client.postJson("/expenses/confirm", confirm.copy(expenseId = 2)), "confirm paid", ErrorCode.EXPENSE_NOT_CONFIRMABLE),
            Triple(client.delete("/expenses/1") { testAuthHeader() }, "DELETE not found", ErrorCode.EXPENSE_NOT_FOUND),
        )

        for ((response, label, code) in cases) {
            assertEquals(code.status, response.status, label)
            assertEquals(code, Json.decodeFromString<ApiError>(response.bodyAsText()).code, label)
        }
    }

    private suspend fun HttpClient.putJson(body: UpdateOperationalExpenseDTO) = put("/expenses") {
        testAuthHeader()
        contentType(ContentType.Application.Json)
        setBody(Json.encodeToString(UpdateOperationalExpenseDTO.serializer(), body))
    }

    private suspend inline fun <reified T> HttpClient.postJson(path: String, body: T) = post(path) {
        testAuthHeader()
        contentType(ContentType.Application.Json)
        setBody(Json.encodeToString(body))
    }
}
