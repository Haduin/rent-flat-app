package pl.chodan.routing

import io.ktor.client.call.body
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.serialization.json.Json
import org.junit.Test
import pl.chodan.ApartmentAndRoomNumberDTO
import pl.chodan.services.ApartmentService
import kotlin.test.assertEquals

// Test module that simulates the apartment routing without authentication
fun Application.testApartmentModule(apartmentService: ApartmentService) {
    // Install ContentNegotiation plugin to handle JSON serialization
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
        })
    }

    routing {
        get("/apartments") {
            // Directly respond with the apartment data, bypassing authentication for the test
            call.respond(apartmentService.getAllApartmentsWithRoomDetails())
        }
    }
}

class ApartmentRoutingTest {

    @Test
    fun testGetApartments() = testApplication {
        // Mock the ApartmentService
        val mockApartmentService = mockk<ApartmentService>()

        // Sample data for testing
        val apartmentSample = ApartmentAndRoomNumberDTO(
            apartmentName = "Test Apartment",
            roomName = "3" // Representing 3 rooms
        )

        // Configure the mock to return our sample data
        coEvery { mockApartmentService.getAllApartmentsWithRoomDetails() } returns listOf(apartmentSample)

        // Configure the test application with our test module
        application {
            testApartmentModule(mockApartmentService)
        }

        // Execute the GET request
        val response = client.get("/apartments") {
            accept(ContentType.Application.Json)
        }

        // Verify the response
        assertEquals(HttpStatusCode.OK, response.status)

        // Optionally, verify the response body
        // val responseBody = response.bodyAsText()
        // println("Response body: $responseBody")
    }
}
