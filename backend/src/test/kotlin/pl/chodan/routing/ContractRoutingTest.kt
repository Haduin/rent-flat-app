package pl.chodan.routing

import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import io.mockk.coEvery
import io.mockk.mockk
import org.junit.Test
import pl.chodan.ContractDTO
import pl.chodan.PersonDTO
import pl.chodan.RoomWithApartmentDTO
import pl.chodan.services.ContractService
import kotlin.test.assertEquals

fun Application.testModule(contractService: ContractService) {
    routing {
        get("/contracts") {
            val contracts = contractService.getAllContractsWithRoomAndPersonDetails()
            call.respond(contracts)
        }
    }
}

class ContractRoutingTest {

    @Test
    fun testGetContracts() = testApplication {
        // Mockowanie ContractService
        val mockContractService = mockk<ContractService>()

        // Przykładowe dane do testu
        val contractSample = ContractDTO(
            id = 1,
            person = PersonDTO(
                id = 1,
                firstName = "John",
                lastName = "Doe",
                documentNumber = "A12345678",
                nationality = "Polish",
                status = "ACTIVE"
            ),
            room = RoomWithApartmentDTO(
                id = 101,
                number = "101",
                apartment = "Green Apartments"
            ),
            startDate = "2025-01-01",
            endDate = "2025-12-31",
            terminationDate = null,
            payedTillDayOfMonth = "15",
            amount = 1500.0,
            deposit = 2000.0,
            depositReturned = false,
            description = "Standard contract",
            status = "ACTIVE"
        )

        // Przygotowanie odpowiedzi mocka
        coEvery { mockContractService.getAllContractsWithRoomAndPersonDetails() } returns listOf(contractSample)

        // Konfiguracja aplikacji testowej ze specjalnym modułem
        application {
            testModule(mockContractService)
        }

        // Wykonanie zapytania GET
        val response = client.get("/contracts") {
            accept(ContentType.Application.Json)
        }

        // Weryfikacja odpowiedzi
        assertEquals(HttpStatusCode.OK, response.status)
    }

}
