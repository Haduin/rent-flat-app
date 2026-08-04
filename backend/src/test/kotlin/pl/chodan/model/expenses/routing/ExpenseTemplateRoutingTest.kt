package pl.chodan.model.expenses.routing

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
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
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
        coEvery { expenseTemplateService.createExpenseTemplate(request) } returns mockk(relaxed = true)

        val response = client.post("/expense-template") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(AddExpenseTemplateRequest.serializer(), request))
        }

        assertEquals(HttpStatusCode.Created, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("Expense template created successfully", body["message"]!!.jsonPrimitive.content)
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
        coEvery { expenseTemplateService.updateExpenseTemplate(5, update) } returns 1

        val response = client.put("/expense-template/5") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdateExpenseTemplate.serializer(), update))
        }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { expenseTemplateService.updateExpenseTemplate(5, update) }
    }

    @Test
    fun `PUT expense-template with a non numeric id returns not found`() = testApplication {
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

        assertEquals(HttpStatusCode.NotFound, response.status)
        coVerify(exactly = 0) { expenseTemplateService.updateExpenseTemplate(any(), any()) }
    }

    // The delete handler never calls call.respond, so Ktor's routing falls back to its default
    // "no response produced" handling instead of an explicit 200/204.
    @Test
    fun `DELETE expense-template calls the service even though the route sends no explicit response`() = testApplication {
        setup()
        coEvery { expenseTemplateService.deleteExpenseTemplate(5) } returns 1

        val response = client.delete("/expense-template/5") { testAuthHeader() }

        assertEquals(HttpStatusCode.NotFound, response.status)
        coVerify(exactly = 1) { expenseTemplateService.deleteExpenseTemplate(5) }
    }
}
