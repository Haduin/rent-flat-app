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
import pl.chodan.model.apartment.dto.RoomDetails
import pl.chodan.model.expenses.dto.NewOperationalExpenseDTO
import pl.chodan.model.expenses.dto.OperationalExpenseDTO
import pl.chodan.model.expenses.dto.UpdateOperationalExpenseDTO
import pl.chodan.model.expenses.service.ExpenseService
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.testAuthHeader
import pl.chodan.ultis.YearMonthString
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class ExpenseRoutingTest {

    private val expenseService = mockk<ExpenseService>()

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module { single { expenseService } })
        application {
            installTestContentNegotiation()
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
            amount = 150.0,
            category = ExpenseCategory.UTILITY_ELECTRICITY,
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
    fun `POST expenses returns bad request when the service throws`() = testApplication {
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
        coEvery { expenseService.addExpense(dto) } throws IllegalStateException("boom")

        val response = client.post("/expenses") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(NewOperationalExpenseDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("boom", body["error"]!!.jsonPrimitive.content)
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
        coEvery { expenseService.updateExpense(dto) } returns 1

        val response = client.put("/expenses") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdateOperationalExpenseDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.OK, response.status)
        coVerify(exactly = 1) { expenseService.updateExpense(dto) }
    }

    @Test
    fun `PUT expenses returns bad request when the service throws`() = testApplication {
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
        coEvery { expenseService.updateExpense(dto) } throws IllegalStateException("nope")

        val response = client.put("/expenses") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdateOperationalExpenseDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
    }

    @Test
    fun `POST expenses generate triggers generation for the given month`() = testApplication {
        setup()
        coEvery { expenseService.generateMonthlyExpenses("2026-08") } returns Unit

        val response = client.post("/expenses/generate?yearMonth=2026-08") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        coVerify(exactly = 1) { expenseService.generateMonthlyExpenses("2026-08") }
    }

    @Test
    fun `POST expenses generate without yearMonth returns bad request`() = testApplication {
        setup()

        val response = client.post("/expenses/generate") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { expenseService.generateMonthlyExpenses(any()) }
    }

    @Test
    fun `POST expenses generate returns bad request when the service throws`() = testApplication {
        setup()
        coEvery { expenseService.generateMonthlyExpenses("2026-08") } throws IllegalStateException("boom")

        val response = client.post("/expenses/generate?yearMonth=2026-08") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
    }

    @Test
    fun `DELETE expenses removes an expense`() = testApplication {
        setup()
        coEvery { expenseService.deleteExpense(7) } returns 1

        val response = client.delete("/expenses/7") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
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
    fun `DELETE expenses returns bad request when the service throws`() = testApplication {
        setup()
        coEvery { expenseService.deleteExpense(7) } throws IllegalStateException("boom")

        val response = client.delete("/expenses/7") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
    }
}
