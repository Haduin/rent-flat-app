package pl.chodan.model.contract.routing

import io.ktor.client.HttpClient
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.koin.dsl.module
import pl.chodan.configureOpenAPI
import pl.chodan.error.ApiError
import pl.chodan.error.ErrorCode
import pl.chodan.model.apartment.service.ApartmentError
import pl.chodan.model.contract.dto.ContractDTO
import pl.chodan.model.contract.dto.ContractHistoryDTO
import pl.chodan.model.contract.dto.DeleteContractDTO
import pl.chodan.model.contract.dto.NewContractDTO
import pl.chodan.model.contract.dto.UpdateContractDetails
import pl.chodan.model.contract.service.ContractError
import pl.chodan.model.contract.service.ContractService
import pl.chodan.model.payments.service.PaymentService
import pl.chodan.model.persons.dto.PersonDTO
import pl.chodan.model.persons.service.PersonError
import pl.chodan.model.room.dto.RoomWithApartmentDTO
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.installTestErrorHandling
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.testAuthHeader
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse

class ContractRoutingTest {

    private val contractService = mockk<ContractService>()
    private val paymentService = mockk<PaymentService>()

    private val newContract = NewContractDTO(
        personId = 1, roomId = 10, startDate = "2026-01-01", endDate = "2026-12-31",
        amount = 2000.0, deposit = 2000.0, payedDate = 10
    )
    private val updateDetails = UpdateContractDetails(
        contractId = 1, roomId = null, amount = 2200.0, deposit = null,
        startDate = null, endDate = null, payedTillDayOfMonth = null
    )
    private val deleteDetails = DeleteContractDTO(
        contractId = 1, terminationDate = "2026-08-04", depositReturned = true,
        positiveCancel = true, description = null
    )

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module {
            single { contractService }
            single { paymentService }
        })
        application {
            installTestContentNegotiation()
            installTestErrorHandling()
            installTestAuthentication()
            configureContractRouting()
        }
    }

    @AfterTest
    fun tearDown() {
        stopTestKoin()
    }

    private fun contractDto(id: Int = 1) = ContractDTO(
        id = id,
        person = PersonDTO(
            id = 1, firstName = "Jan", lastName = "Kowalski",
            documentNumber = "ABC123", nationality = "PL", status = "RESIDENT"
        ),
        room = RoomWithApartmentDTO(id = 10, number = "1", apartment = "Mieszkanie A"),
        startDate = "2026-01-01",
        endDate = "2026-12-31",
        terminationDate = null,
        payedTillDayOfMonth = "10",
        amount = 2000.0,
        deposit = 2000.0,
        depositReturned = null,
        description = null,
        status = "ACTIVE",
        expiringSoon = false,
        alreadyExpired = false
    )

    @Test
    fun `GET contracts returns all contracts`() = testApplication {
        setup()
        coEvery { contractService.getAllContractsWithRoomAndPersonDetails() } returns listOf(contractDto())

        val response = client.get("/contracts") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
    }

    @Test
    fun `GET contracts without an authenticated user is rejected`() = testApplication {
        setup()

        val response = client.get("/contracts")

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun `GET contracts history returns the change history oldest first`() = testApplication {
        setup()
        val history = listOf(
            ContractHistoryDTO(
                id = 1, contractId = 1, changeType = "CREATED", changedAt = "2026-01-01T10:00:00",
                roomId = 10, amount = 1500.0, deposit = 1500.0, depositReturned = null,
                startDate = "2026-01-01", endDate = "2026-12-31", terminationDate = null,
                description = null, status = "ACTIVE", payedTillDayOfMonth = "10"
            ),
            ContractHistoryDTO(
                id = 2, contractId = 1, changeType = "UPDATED", changedAt = "2026-02-01T10:00:00",
                roomId = 10, amount = 1700.0, deposit = 1500.0, depositReturned = null,
                startDate = "2026-01-01", endDate = "2026-12-31", terminationDate = null,
                description = null, status = "ACTIVE", payedTillDayOfMonth = "10"
            ),
        )
        coEvery { contractService.getContractHistory(1) } returns history

        val response = client.get("/contracts/1/history") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(2, body.size)
        assertEquals("CREATED", body[0].jsonObject["changeType"]!!.jsonPrimitive.content)
        assertEquals("UPDATED", body[1].jsonObject["changeType"]!!.jsonPrimitive.content)
        assertEquals(1700.0, body[1].jsonObject["amount"]!!.jsonPrimitive.content.toDouble())
    }

    @Test
    fun `GET contracts history with a non numeric id returns validation error`() = testApplication {
        setup()

        val response = client.get("/contracts/abc/history") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(ErrorCode.VALIDATION_FAILED, response.apiError().code)
        coVerify(exactly = 0) { contractService.getContractHistory(any()) }
    }

    @Test
    fun `GET contracts history without an authenticated user is rejected`() = testApplication {
        setup()

        val response = client.get("/contracts/1/history")

        assertEquals(HttpStatusCode.Unauthorized, response.status)
        coVerify(exactly = 0) { contractService.getContractHistory(any()) }
    }

    @Test
    fun `POST contracts generateMonthlyPayments generates payments for a valid month`() = testApplication {
        setup()
        coEvery { paymentService.generateNewPaymentsForActiveContracts("2026-08") } returns Unit

        val response = client.post("/contracts/generateMonthlyPayments/2026-08") { testAuthHeader() }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { paymentService.generateNewPaymentsForActiveContracts("2026-08") }
    }

    @Test
    fun `POST contracts generateMonthlyPayments with an invalid month returns validation error`() = testApplication {
        setup()

        val response = client.post("/contracts/generateMonthlyPayments/not-a-month") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(ErrorCode.VALIDATION_FAILED, response.apiError().code)
        coVerify(exactly = 0) { paymentService.generateNewPaymentsForActiveContracts(any()) }
    }

    @Test
    fun `POST contracts generateMonthlyPayments returns internal server error without leaking the cause`() =
        testApplication {
            setup()
            coEvery { paymentService.generateNewPaymentsForActiveContracts("2026-08") } throws IllegalStateException("boom")

            val response = client.post("/contracts/generateMonthlyPayments/2026-08") { testAuthHeader() }

            assertEquals(HttpStatusCode.InternalServerError, response.status)
            assertEquals(ErrorCode.INTERNAL_ERROR, response.apiError().code)
            assertFalse(response.bodyAsText().contains("boom"))
        }

    @Test
    fun `POST contracts creates a new contract`() = testApplication {
        setup()
        coEvery { contractService.createContract(newContract) } returns 99

        val response = client.postJson("/contracts", NewContractDTO.serializer(), newContract)

        assertEquals(HttpStatusCode.Created, response.status)
        assertEquals(99, Json.parseToJsonElement(response.bodyAsText()).jsonObject["id"]!!.jsonPrimitive.content.toInt())
        coVerify(exactly = 1) { contractService.createContract(newContract) }
    }

    @Test
    fun `POST contracts with invalid fields returns validation details`() = testApplication {
        setup()
        val invalid = newContract.copy(amount = 0.0, payedDate = 29, startDate = "01-01-2026")

        val response = client.postJson("/contracts", NewContractDTO.serializer(), invalid)

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val error = response.apiError()
        assertEquals(ErrorCode.VALIDATION_FAILED, error.code)
        assertEquals(3, error.details.size)
        coVerify(exactly = 0) { contractService.createContract(any()) }
    }

    @Test
    fun `PUT contracts updates contract details`() = testApplication {
        setup()
        coEvery { contractService.updateContract(updateDetails) } returns Unit

        val response = client.putJson("/contracts", UpdateContractDetails.serializer(), updateDetails)

        assertEquals(HttpStatusCode.NoContent, response.status)
        assertEquals("", response.bodyAsText())
        coVerify(exactly = 1) { contractService.updateContract(updateDetails) }
    }

    @Test
    fun `PUT contracts with only the contract id returns validation error`() = testApplication {
        setup()

        val response = client.putJson("/contracts", UpdateContractDetails.serializer(), updateDetails.copy(amount = null))

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val error = response.apiError()
        assertEquals(ErrorCode.VALIDATION_FAILED, error.code)
        assertEquals(listOf("Podaj co najmniej jedno pole do zmiany"), error.details)
        coVerify(exactly = 0) { contractService.updateContract(any()) }
    }

    @Test
    fun `DELETE contracts finishes a contract successfully`() = testApplication {
        setup()
        coEvery { contractService.deleteContract(deleteDetails) } returns Unit

        val response = client.deleteJson("/contracts", DeleteContractDTO.serializer(), deleteDetails)

        assertEquals(HttpStatusCode.NoContent, response.status)
    }

    @Test
    fun `DELETE contracts returns invalid payload for a malformed body`() = testApplication {
        setup()

        val response = client.delete("/contracts") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody("{}")
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(ErrorCode.INVALID_PAYLOAD, response.apiError().code)
        coVerify(exactly = 0) { contractService.deleteContract(any()) }
    }

    @Test
    fun `DELETE contracts with a malformed termination date returns validation details`() = testApplication {
        setup()

        val response = client.deleteJson(
            "/contracts", DeleteContractDTO.serializer(), deleteDetails.copy(terminationDate = "04.08.2026")
        )

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(listOf("terminationDate: wymagany format yyyy-MM-dd"), response.apiError().details)
    }

    @Test
    fun `domain errors of each endpoint map to their status and code`() = testApplication {
        setup()
        coEvery { contractService.getContractHistory(99) } throws ContractError.NotFound(99)
        coEvery { contractService.createContract(newContract) } throws PersonError.NotFound(1)
        coEvery { contractService.createContract(newContract.copy(personId = 2)) } throws ApartmentError.RoomNotFound(10)
        coEvery { contractService.updateContract(updateDetails) } throws ContractError.NotFound(1)
        coEvery { contractService.updateContract(updateDetails.copy(contractId = 2)) } throws ApartmentError.RoomNotFound(10)
        coEvery { contractService.updateContract(updateDetails.copy(contractId = 3)) } throws ContractError.Terminated()
        coEvery { contractService.deleteContract(deleteDetails) } throws ContractError.NotFound(1)
        coEvery { contractService.deleteContract(deleteDetails.copy(contractId = 3)) } throws ContractError.Terminated()
        val cases = listOf(
            Triple(client.get("/contracts/99/history") { testAuthHeader() }, "GET history", ErrorCode.CONTRACT_NOT_FOUND),
            Triple(client.postJson("/contracts", NewContractDTO.serializer(), newContract), "POST person", ErrorCode.PERSON_NOT_FOUND),
            Triple(client.postJson("/contracts", NewContractDTO.serializer(), newContract.copy(personId = 2)), "POST room", ErrorCode.ROOM_NOT_FOUND),
            Triple(client.putJson("/contracts", UpdateContractDetails.serializer(), updateDetails), "PUT contract", ErrorCode.CONTRACT_NOT_FOUND),
            Triple(client.putJson("/contracts", UpdateContractDetails.serializer(), updateDetails.copy(contractId = 2)), "PUT room", ErrorCode.ROOM_NOT_FOUND),
            Triple(client.putJson("/contracts", UpdateContractDetails.serializer(), updateDetails.copy(contractId = 3)), "PUT terminated", ErrorCode.CONTRACT_TERMINATED),
            Triple(client.deleteJson("/contracts", DeleteContractDTO.serializer(), deleteDetails), "DELETE contract", ErrorCode.CONTRACT_NOT_FOUND),
            Triple(client.deleteJson("/contracts", DeleteContractDTO.serializer(), deleteDetails.copy(contractId = 3)), "DELETE terminated", ErrorCode.CONTRACT_TERMINATED),
        )

        for ((response, label, code) in cases) {
            assertEquals(code.status, response.status, label)
            assertEquals(code, response.apiError().code, label)
        }
    }

    private suspend fun <T> HttpClient.postJson(url: String, serializer: KSerializer<T>, body: T) =
        post(url) { jsonBody(serializer, body) }

    private suspend fun <T> HttpClient.putJson(url: String, serializer: KSerializer<T>, body: T) =
        put(url) { jsonBody(serializer, body) }

    private suspend fun <T> HttpClient.deleteJson(url: String, serializer: KSerializer<T>, body: T) =
        delete(url) { jsonBody(serializer, body) }

    private fun <T> HttpRequestBuilder.jsonBody(serializer: KSerializer<T>, body: T) {
        testAuthHeader()
        contentType(ContentType.Application.Json)
        setBody(Json.encodeToString(serializer, body))
    }

    private suspend fun HttpResponse.apiError() = Json.decodeFromString<ApiError>(bodyAsText())

    @Test
    fun `OpenAPI for PUT contracts lists its declared codes grouped by status and the global 401`() = testApplication {
        setup()
        application { configureOpenAPI() }

        val responses = Json.parseToJsonElement(client.get("/openapi.json").bodyAsText()).jsonObject["paths"]!!
            .jsonObject["/contracts"]!!.jsonObject["put"]!!.jsonObject["responses"]!!.jsonObject

        fun description(status: String) = responses[status]!!.jsonObject["description"]!!.jsonPrimitive.content
        assertEquals("CONTRACT_NOT_FOUND, ROOM_NOT_FOUND", description("404"))
        assertEquals("CONTRACT_TERMINATED", description("409"))
        assertEquals("UNAUTHORIZED", description("401"))
    }
}
