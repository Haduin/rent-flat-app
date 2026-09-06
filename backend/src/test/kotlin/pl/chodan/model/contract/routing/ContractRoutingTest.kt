package pl.chodan.model.contract.routing

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.koin.dsl.module
import pl.chodan.model.contract.dto.ContractDTO
import pl.chodan.model.contract.dto.ContractHistoryDTO
import pl.chodan.model.contract.dto.DeleteContractDTO
import pl.chodan.model.contract.dto.NewContractDTO
import pl.chodan.model.contract.dto.UpdateContractDetails
import pl.chodan.model.contract.service.ContractDeleteResult
import pl.chodan.model.contract.service.ContractService
import pl.chodan.model.payments.service.PaymentService
import pl.chodan.model.persons.dto.PersonDTO
import pl.chodan.model.room.dto.RoomWithApartmentDTO
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.testAuthHeader
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class ContractRoutingTest {

    private val contractService = mockk<ContractService>()
    private val paymentService = mockk<PaymentService>()

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module {
            single { contractService }
            single { paymentService }
        })
        application {
            installTestContentNegotiation()
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
        expiringSoon = false
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
    fun `GET contracts history with a non numeric id returns bad request`() = testApplication {
        setup()

        val response = client.get("/contracts/abc/history") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
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

        assertEquals(HttpStatusCode.Created, response.status)
        coVerify(exactly = 1) { paymentService.generateNewPaymentsForActiveContracts("2026-08") }
    }

    @Test
    fun `POST contracts generateMonthlyPayments with an invalid month returns bad request`() = testApplication {
        setup()

        val response = client.post("/contracts/generateMonthlyPayments/not-a-month") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { paymentService.generateNewPaymentsForActiveContracts(any()) }
    }

    @Test
    fun `POST contracts generateMonthlyPayments returns internal server error when generation fails`() =
        testApplication {
            setup()
            coEvery { paymentService.generateNewPaymentsForActiveContracts("2026-08") } throws IllegalStateException("boom")

            val response = client.post("/contracts/generateMonthlyPayments/2026-08") { testAuthHeader() }

            assertEquals(HttpStatusCode.InternalServerError, response.status)
        }

    @Test
    fun `POST contracts creates a new contract`() = testApplication {
        setup()
        val dto = NewContractDTO(
            personId = 1, roomId = 10, startDate = "2026-01-01", endDate = "2026-12-31",
            amount = 2000.0, deposit = 2000.0, payedDate = 10
        )
        coEvery { contractService.createContract(dto) } returns 99

        val response = client.post("/contracts") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(NewContractDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.Created, response.status)
        coVerify(exactly = 1) { contractService.createContract(dto) }
    }

    // The create-contract handler only logs on failure and never calls call.respond, so Ktor's
    // routing falls back to its default "no response produced" handling (404) instead of an error code.
    @Test
    fun `POST contracts sends no explicit response when creation fails`() = testApplication {
        setup()
        val dto = NewContractDTO(
            personId = 1, roomId = 10, startDate = "2026-01-01", endDate = "2026-12-31",
            amount = 2000.0, deposit = 2000.0, payedDate = 10
        )
        coEvery { contractService.createContract(dto) } throws IllegalStateException("boom")

        val response = client.post("/contracts") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(NewContractDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.NotFound, response.status)
    }

    @Test
    fun `PUT contracts updates contract details`() = testApplication {
        setup()
        val dto = UpdateContractDetails(
            contractId = 1, roomId = null, amount = 2200.0, deposit = null,
            startDate = null, endDate = null, payedTillDayOfMonth = null
        )
        coEvery { contractService.updateContract(dto) } returns Unit

        val response = client.put("/contracts") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdateContractDetails.serializer(), dto))
        }

        assertEquals(HttpStatusCode.OK, response.status)
        coVerify(exactly = 1) { contractService.updateContract(dto) }
    }

    @Test
    fun `PUT contracts returns bad request when the update fails`() = testApplication {
        setup()
        val dto = UpdateContractDetails(
            contractId = 1, roomId = null, amount = 2200.0, deposit = null,
            startDate = null, endDate = null, payedTillDayOfMonth = null
        )
        coEvery { contractService.updateContract(dto) } throws IllegalStateException("boom")

        val response = client.put("/contracts") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdateContractDetails.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
    }

    @Test
    fun `DELETE contracts finishes a contract successfully`() = testApplication {
        setup()
        val dto = DeleteContractDTO(
            contractId = 1, terminationDate = "2026-08-04", depositReturned = true,
            positiveCancel = true, description = null
        )
        coEvery { contractService.deleteContract(dto) } returns ContractDeleteResult.Success(1)

        val response = client.delete("/contracts") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(DeleteContractDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.OK, response.status)
    }

    @Test
    fun `DELETE contracts returns not found when the contract does not exist`() = testApplication {
        setup()
        val dto = DeleteContractDTO(
            contractId = 404, terminationDate = "2026-08-04", depositReturned = null,
            positiveCancel = null, description = null
        )
        coEvery { contractService.deleteContract(dto) } returns ContractDeleteResult.NotFound

        val response = client.delete("/contracts") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(DeleteContractDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.NotFound, response.status)
    }

    @Test
    fun `DELETE contracts returns internal server error on payment update failure`() = testApplication {
        setup()
        val dto = DeleteContractDTO(
            contractId = 1, terminationDate = "2026-08-04", depositReturned = null,
            positiveCancel = null, description = null
        )
        coEvery { contractService.deleteContract(dto) } returns
            ContractDeleteResult.PaymentUpdateError("payment update failed")

        val response = client.delete("/contracts") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(DeleteContractDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.InternalServerError, response.status)
    }

    @Test
    fun `DELETE contracts returns internal server error on contract update failure`() = testApplication {
        setup()
        val dto = DeleteContractDTO(
            contractId = 1, terminationDate = "2026-08-04", depositReturned = null,
            positiveCancel = null, description = null
        )
        coEvery { contractService.deleteContract(dto) } returns
            ContractDeleteResult.ContractUpdateError("contract update failed")

        val response = client.delete("/contracts") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(DeleteContractDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.InternalServerError, response.status)
    }
}
