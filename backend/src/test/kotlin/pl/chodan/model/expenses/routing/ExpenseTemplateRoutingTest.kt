package pl.chodan.model.expenses.routing

import io.ktor.client.HttpClient
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.koin.dsl.module
import pl.chodan.database.ExpenseCategory
import pl.chodan.model.apartment.dto.ApartmentResponse
import pl.chodan.model.expenses.dto.AddExpenseTemplateRequest
import pl.chodan.model.expenses.dto.OperationalExpenseTemplateResponse
import pl.chodan.model.expenses.dto.UpdateExpenseTemplate
import pl.chodan.model.expenses.service.ExpenseTemplateService
import pl.chodan.model.room.dto.RoomResponse
import pl.chodan.error.ApiError
import pl.chodan.error.ErrorCode
import pl.chodan.model.apartment.service.ApartmentError
import pl.chodan.model.expenses.service.ExpenseError
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.installTestErrorHandling
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.testAuthHeader
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class ExpenseTemplateRoutingTest {

    private val expenseTemplateService = mockk<ExpenseTemplateService>()

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module { single { expenseTemplateService } })
        application {
            installTestContentNegotiation()
            installTestErrorHandling()
            installTestAuthentication()
            configureExpenseTemplateRouting()
        }
    }

    @AfterTest
    fun tearDown() {
        stopTestKoin()
    }

    @Test
    fun `POST expense-template creates a template`() = testApplication {
        setup()
        val request = AddExpenseTemplateRequest(
            apartmentId = 10,
            roomId = null,
            amount = 250.0,
            category = ExpenseCategory.OWNER_RENT,
            expenseDate = "10"
        )
        coEvery { expenseTemplateService.createExpenseTemplate(request) } returns 1

        val response = client.post("/expense-template") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(AddExpenseTemplateRequest.serializer(), request))
        }

        assertEquals(HttpStatusCode.Created, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals(1, body["id"]!!.jsonPrimitive.int)
        coVerify(exactly = 1) { expenseTemplateService.createExpenseTemplate(request) }
    }

    @Test
    fun `POST expense-template without an authenticated user is rejected`() = testApplication {
        setup()
        val request = AddExpenseTemplateRequest(
            apartmentId = 10,
            roomId = null,
            amount = 250.0,
            category = ExpenseCategory.OWNER_RENT,
            expenseDate = "10"
        )

        val response = client.post("/expense-template") {
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(AddExpenseTemplateRequest.serializer(), request))
        }

        assertEquals(HttpStatusCode.Unauthorized, response.status)
        coVerify(exactly = 0) { expenseTemplateService.createExpenseTemplate(any()) }
    }

    @Test
    fun `GET expense-template returns all templates`() = testApplication {
        setup()
        val template = OperationalExpenseTemplateResponse(
            id = 1,
            apartment = ApartmentResponse(id = 10, name = "Mieszkanie A"),
            room = RoomResponse(id = 20, name = "Pokój 1", apartmentId = 10),
            amount = 250.0,
            category = ExpenseCategory.OWNER_RENT,
            dayOfMonth = 10,
            active = true
        )
        coEvery { expenseTemplateService.findAll() } returns listOf(template)

        val response = client.get("/expense-template") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
        assertEquals(1, body[0].jsonObject["id"]!!.jsonPrimitive.int)
    }

    // response.isNotEmpty().let { call.respond(response) } runs unconditionally, since Boolean.let
    // is not a conditional - an empty list is still serialized and returned with 200 OK.
    @Test
    fun `GET expense-template returns 200 with an empty body when there are no templates`() = testApplication {
        setup()
        coEvery { expenseTemplateService.findAll() } returns emptyList()

        val response = client.get("/expense-template") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("[]", response.bodyAsText())
    }

    @Test
    fun `PUT expense-template updates an existing template`() = testApplication {
        setup()
        val update = UpdateExpenseTemplate(
            apartmentId = null,
            roomId = null,
            amount = 300.0,
            category = null,
            expenseDate = null
        )
        coEvery { expenseTemplateService.updateExpenseTemplate(5, update) } returns Unit

        val response = client.put("/expense-template/5") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdateExpenseTemplate.serializer(), update))
        }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { expenseTemplateService.updateExpenseTemplate(5, update) }
    }

    @Test
    fun `PUT expense-template with a non numeric id returns bad request`() = testApplication {
        setup()
        val update = UpdateExpenseTemplate(
            apartmentId = null,
            roomId = null,
            amount = 300.0,
            category = null,
            expenseDate = null
        )

        val response = client.put("/expense-template/abc") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdateExpenseTemplate.serializer(), update))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { expenseTemplateService.updateExpenseTemplate(any(), any()) }
    }

    @Test
    fun `PUT expense-template returns not found when the template does not exist`() = testApplication {
        setup()
        val update = UpdateExpenseTemplate(
            apartmentId = null,
            roomId = null,
            amount = 300.0,
            category = null,
            expenseDate = null
        )
        coEvery { expenseTemplateService.updateExpenseTemplate(5, update) } throws
                ExpenseError.TemplateNotFound(5)

        val response = client.put("/expense-template/5") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdateExpenseTemplate.serializer(), update))
        }

        assertEquals(HttpStatusCode.NotFound, response.status)
        assertEquals(ErrorCode.EXPENSE_TEMPLATE_NOT_FOUND, Json.decodeFromString<ApiError>(response.bodyAsText()).code)
    }

    @Test
    fun `PUT expense-template with an invalid day of month returns validation details`() = testApplication {
        setup()
        val update = UpdateExpenseTemplate(
            apartmentId = null,
            roomId = null,
            amount = null,
            category = null,
            expenseDate = "40"
        )

        val response = client.put("/expense-template/5") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdateExpenseTemplate.serializer(), update))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(
            listOf("expenseDate: dzień miesiąca musi być z zakresu 1-31"),
            Json.decodeFromString<ApiError>(response.bodyAsText()).details
        )
        coVerify(exactly = 0) { expenseTemplateService.updateExpenseTemplate(any(), any()) }
    }

    @Test
    fun `DELETE expense-template deactivates the template`() = testApplication {
        setup()
        coEvery { expenseTemplateService.deleteExpenseTemplate(5) } returns Unit

        val response = client.delete("/expense-template/5") { testAuthHeader() }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { expenseTemplateService.deleteExpenseTemplate(5) }
    }

    @Test
    fun `DELETE expense-template with a non numeric id returns bad request`() = testApplication {
        setup()

        val response = client.delete("/expense-template/abc") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { expenseTemplateService.deleteExpenseTemplate(any()) }
    }

    @Test
    fun `DELETE expense-template without an authenticated user is rejected`() = testApplication {
        setup()

        val response = client.delete("/expense-template/5")

        assertEquals(HttpStatusCode.Unauthorized, response.status)
        coVerify(exactly = 0) { expenseTemplateService.deleteExpenseTemplate(any()) }
    }

    @Test
    fun `PUT expense-template with no fields returns validation error`() = testApplication {
        setup()
        val update = UpdateExpenseTemplate(apartmentId = null, roomId = null, amount = null, category = null, expenseDate = null)

        val response = client.put("/expense-template/5") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdateExpenseTemplate.serializer(), update))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val error = Json.decodeFromString<ApiError>(response.bodyAsText())
        assertEquals(ErrorCode.VALIDATION_FAILED, error.code)
        assertEquals(listOf("Podaj co najmniej jedno pole do zmiany"), error.details)
        coVerify(exactly = 0) { expenseTemplateService.updateExpenseTemplate(any(), any()) }
    }

    @Test
    fun `domain errors of each endpoint map to their status and code`() = testApplication {
        setup()
        val create = AddExpenseTemplateRequest(
            apartmentId = 10, roomId = null, amount = 250.0, category = ExpenseCategory.OWNER_RENT, expenseDate = "10"
        )
        val update = UpdateExpenseTemplate(apartmentId = null, roomId = null, amount = 300.0, category = null, expenseDate = null)
        coEvery { expenseTemplateService.createExpenseTemplate(create) } throws ApartmentError.NotFound(10)
        coEvery { expenseTemplateService.createExpenseTemplate(create.copy(roomId = 20)) } throws ApartmentError.RoomNotFound(20)
        coEvery { expenseTemplateService.updateExpenseTemplate(1, update) } throws ExpenseError.TemplateNotFound(1)
        coEvery { expenseTemplateService.updateExpenseTemplate(2, update) } throws ApartmentError.NotFound(10)
        coEvery { expenseTemplateService.updateExpenseTemplate(3, update) } throws ApartmentError.RoomNotFound(20)
        coEvery { expenseTemplateService.updateExpenseTemplate(4, update) } throws ExpenseError.TemplateInactive(4)
        coEvery { expenseTemplateService.deleteExpenseTemplate(1) } throws ExpenseError.TemplateNotFound(1)
        val cases = listOf(
            Triple(client.postJson(create), "POST apartment", ErrorCode.APARTMENT_NOT_FOUND),
            Triple(client.postJson(create.copy(roomId = 20)), "POST room", ErrorCode.ROOM_NOT_FOUND),
            Triple(client.putJson(1, update), "PUT template", ErrorCode.EXPENSE_TEMPLATE_NOT_FOUND),
            Triple(client.putJson(2, update), "PUT apartment", ErrorCode.APARTMENT_NOT_FOUND),
            Triple(client.putJson(3, update), "PUT room", ErrorCode.ROOM_NOT_FOUND),
            Triple(client.putJson(4, update), "PUT inactive template", ErrorCode.EXPENSE_TEMPLATE_INACTIVE),
            Triple(client.delete("/expense-template/1") { testAuthHeader() }, "DELETE template", ErrorCode.EXPENSE_TEMPLATE_NOT_FOUND),
        )

        for ((response, label, code) in cases) {
            assertEquals(code.status, response.status, label)
            assertEquals(code, Json.decodeFromString<ApiError>(response.bodyAsText()).code, label)
        }
    }

    private suspend fun HttpClient.postJson(body: AddExpenseTemplateRequest) = post("/expense-template") {
        testAuthHeader()
        contentType(ContentType.Application.Json)
        setBody(Json.encodeToString(AddExpenseTemplateRequest.serializer(), body))
    }

    private suspend fun HttpClient.putJson(id: Int, body: UpdateExpenseTemplate) = put("/expense-template/$id") {
        testAuthHeader()
        contentType(ContentType.Application.Json)
        setBody(Json.encodeToString(UpdateExpenseTemplate.serializer(), body))
    }
}
