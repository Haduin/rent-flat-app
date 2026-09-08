package pl.chodan.model.room.routing

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
import pl.chodan.model.room.dto.RoomWithApartmentDTO
import pl.chodan.model.room.service.RoomService
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.testAuthHeader
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class RoomRoutingTest {

    private val roomService = mockk<RoomService>()

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module { single { roomService } })
        application {
            installTestContentNegotiation()
            installTestAuthentication()
            configureRoomRouting()
        }
    }

    @AfterTest
    fun tearDown() {
        stopTestKoin()
    }

    @Test
    fun `GET rooms returns rooms with their apartments`() = testApplication {
        setup()
        val room = RoomWithApartmentDTO(id = 1, number = "1", apartment = "Mieszkanie A")
        coEvery { roomService.getRoomsWithAparts() } returns listOf(room)

        val response = client.get("/rooms") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
    }

    @Test
    fun `GET rooms without an authenticated user is rejected`() = testApplication {
        setup()

        val response = client.get("/rooms")

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun `GET rooms non-occupied returns free rooms between dates`() = testApplication {
        setup()
        val room = RoomWithApartmentDTO(id = 1, number = "1", apartment = "Mieszkanie A")
        coEvery { roomService.fetchFreeRoomsBetweenDates("2026-08-01", "2026-08-31") } returns listOf(room)

        val response = client.get("/rooms/non-occupied?startDate=2026-08-01&endDate=2026-08-31") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
        coVerify(exactly = 1) { roomService.fetchFreeRoomsBetweenDates("2026-08-01", "2026-08-31") }
    }

    @Test
    fun `GET rooms non-occupied returns bad request when the service throws`() = testApplication {
        setup()
        coEvery {
            roomService.fetchFreeRoomsBetweenDates("not-a-date", "also-not-a-date")
        } throws IllegalArgumentException("boom")

        val response =
            client.get("/rooms/non-occupied?startDate=not-a-date&endDate=also-not-a-date") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
    }

    @Test
    fun `GET rooms non-occupied without dates delegates empty strings to the service`() = testApplication {
        setup()
        coEvery { roomService.fetchFreeRoomsBetweenDates("", "") } returns emptyList()

        val response = client.get("/rooms/non-occupied") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        coVerify(exactly = 1) { roomService.fetchFreeRoomsBetweenDates("", "") }
    }
}
