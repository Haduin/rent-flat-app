package pl.chodan.model.apartment.routing

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.koin.dsl.module
import pl.chodan.model.apartment.dto.ApartmentWithRooms
import pl.chodan.model.apartment.dto.RoomDetails
import pl.chodan.model.apartment.service.ApartmentService
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class ApartmentRoutingTest {

    private val apartmentService = mockk<ApartmentService>()

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module { single { apartmentService } })
        application {
            installTestContentNegotiation()
            configureApartmentRouting()
        }
    }

    @AfterTest
    fun tearDown() {
        stopTestKoin()
    }

    @Test
    fun `GET apartments returns apartments with their rooms`() = testApplication {
        setup()
        val apartment = ApartmentWithRooms(
            apartmentId = 1,
            apartmentName = "Mieszkanie A",
            rooms = listOf(RoomDetails(roomId = 10, roomName = "Pokój 1", apartmentId = 1))
        )
        coEvery { apartmentService.getAllApartmentsWithRoomDetails() } returns listOf(apartment)

        val response = client.get("/apartments")

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
        assertEquals(1, body[0].jsonObject["apartmentId"]!!.jsonPrimitive.int)
    }

    @Test
    fun `GET apartments hello greets the given name`() = testApplication {
        setup()

        val response = client.get("/apartments/hello?name=Jan")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("Hello Jan!", response.bodyAsText())
    }

    @Test
    fun `GET apartments hello without a name defaults to World`() = testApplication {
        setup()

        val response = client.get("/apartments/hello")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("Hello World!", response.bodyAsText())
    }
}
