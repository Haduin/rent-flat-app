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
import pl.chodan.error.ApiError
import pl.chodan.error.ErrorCode
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.installTestErrorHandling
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
            installTestErrorHandling()
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
    fun `GET rooms non-occupied with a malformed date returns bad request`() = testApplication {
        setup()

        val response =
            client.get("/rooms/non-occupied?startDate=not-a-date&endDate=2026-08-31") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(ErrorCode.VALIDATION_FAILED, Json.decodeFromString<ApiError>(response.bodyAsText()).code)
        coVerify(exactly = 0) { roomService.fetchFreeRoomsBetweenDates(any(), any()) }
    }

    @Test
    fun `GET rooms non-occupied without dates returns bad request`() = testApplication {
        setup()

        val response = client.get("/rooms/non-occupied") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { roomService.fetchFreeRoomsBetweenDates(any(), any()) }
    }
}
