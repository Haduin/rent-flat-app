package pl.chodan.model.apartment.routing

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
import pl.chodan.model.apartment.dto.ApartmentResponse
import pl.chodan.model.apartment.dto.ApartmentWithRooms
import pl.chodan.model.apartment.dto.RoomDetails
import pl.chodan.model.apartment.service.ApartmentService
import pl.chodan.model.apartment.service.RoomDeletion
import pl.chodan.model.room.dto.RoomResponse
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.testAuthHeader
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class ApartmentRoutingTest {

    private val apartmentService = mockk<ApartmentService>()

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module { single { apartmentService } })
        application {
            installTestContentNegotiation()
            installTestAuthentication()
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

        val response = client.get("/apartments") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
        assertEquals(1, body[0].jsonObject["apartmentId"]!!.jsonPrimitive.int)
    }



    private fun HttpRequestBuilder.jsonName(name: String) {
        testAuthHeader()
        contentType(ContentType.Application.Json)
        setBody("""{"name":"$name"}""")
    }

    @Test
    fun `POST apartments creates an apartment with the trimmed name`() = testApplication {
        setup()
        coEvery { apartmentService.createApartment("Chmielna") } returns ApartmentResponse(id = 3, name = "Chmielna")

        val response = client.post("/apartments") { jsonName("  Chmielna ") }

        assertEquals(HttpStatusCode.Created, response.status)
        assertEquals(3, Json.parseToJsonElement(response.bodyAsText()).jsonObject["id"]!!.jsonPrimitive.int)
    }

    @Test
    fun `POST apartments rejects a blank name`() = testApplication {
        setup()

        val response = client.post("/apartments") { jsonName("   ") }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { apartmentService.createApartment(any()) }
    }

    @Test
    fun `POST apartments requires authentication`() = testApplication {
        setup()

        val response = client.post("/apartments") {
            contentType(ContentType.Application.Json)
            setBody("""{"name":"Chmielna"}""")
        }

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun `PUT apartment answers 404 for an unknown apartment`() = testApplication {
        setup()
        coEvery { apartmentService.renameApartment(99, "Nowa") } returns false

        val response = client.put("/apartments/99") { jsonName("Nowa") }

        assertEquals(HttpStatusCode.NotFound, response.status)
    }

    @Test
    fun `PUT apartment renames an existing apartment`() = testApplication {
        setup()
        coEvery { apartmentService.renameApartment(1, "Nowa") } returns true

        val response = client.put("/apartments/1") { jsonName("Nowa") }

        assertEquals(HttpStatusCode.NoContent, response.status)
    }

    @Test
    fun `POST rooms creates a room in the apartment`() = testApplication {
        setup()
        coEvery { apartmentService.createRoom(1, "Pok 5") } returns RoomResponse(id = 7, name = "Pok 5", apartmentId = 1)

        val response = client.post("/apartments/1/rooms") { jsonName("Pok 5") }

        assertEquals(HttpStatusCode.Created, response.status)
        assertEquals(7, Json.parseToJsonElement(response.bodyAsText()).jsonObject["id"]!!.jsonPrimitive.int)
    }

    @Test
    fun `POST rooms answers 404 when the apartment does not exist`() = testApplication {
        setup()
        coEvery { apartmentService.createRoom(99, "Pok 5") } returns null

        val response = client.post("/apartments/99/rooms") { jsonName("Pok 5") }

        assertEquals(HttpStatusCode.NotFound, response.status)
    }

    @Test
    fun `PUT room renames a room of the apartment`() = testApplication {
        setup()
        coEvery { apartmentService.renameRoom(1, 7, "Pok 6") } returns true

        val response = client.put("/apartments/1/rooms/7") { jsonName("Pok 6") }

        assertEquals(HttpStatusCode.NoContent, response.status)
    }

    @Test
    fun `DELETE room maps the service outcome to a status`() = testApplication {
        setup()
        coEvery { apartmentService.deleteRoom(1, 7) } returns RoomDeletion.DELETED
        coEvery { apartmentService.deleteRoom(1, 8) } returns RoomDeletion.IN_USE
        coEvery { apartmentService.deleteRoom(1, 9) } returns RoomDeletion.NOT_FOUND

        assertEquals(HttpStatusCode.NoContent, client.delete("/apartments/1/rooms/7") { testAuthHeader() }.status)
        assertEquals(HttpStatusCode.Conflict, client.delete("/apartments/1/rooms/8") { testAuthHeader() }.status)
        assertEquals(HttpStatusCode.NotFound, client.delete("/apartments/1/rooms/9") { testAuthHeader() }.status)
        assertEquals(HttpStatusCode.Unauthorized, client.delete("/apartments/1/rooms/7").status)
    }
}
