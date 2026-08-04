package pl.chodan.model.perons.routing

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
import pl.chodan.model.perons.dto.CreatedPersonDTO
import pl.chodan.model.perons.dto.PersonDTO
import pl.chodan.model.perons.dto.UpdatePersonDTO
import pl.chodan.model.perons.service.PersonService
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.testAuthHeader
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class PersonRoutingTest {

    private val personService = mockk<PersonService>()

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module { single { personService } })
        application {
            installTestContentNegotiation()
            installTestAuthentication()
            configurePersonRouting()
        }
    }

    @AfterTest
    fun tearDown() {
        stopTestKoin()
    }

    private fun personDto(id: Int = 1) = PersonDTO(
        id = id, firstName = "Jan", lastName = "Kowalski",
        documentNumber = "ABC123", nationality = "PL", status = "RESIDENT"
    )

    @Test
    fun `GET persons returns all persons`() = testApplication {
        setup()
        coEvery { personService.getAllPersons() } returns listOf(personDto())

        val response = client.get("/persons") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
    }

    @Test
    fun `GET persons without an authenticated user is rejected`() = testApplication {
        setup()

        val response = client.get("/persons")

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun `GET persons non-residents returns only non-resident persons`() = testApplication {
        setup()
        coEvery { personService.getNonResidentPersons() } returns listOf(personDto().copy(status = "NON_RESIDENT"))

        val response = client.get("/persons/non-residents") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertEquals(1, body.size)
    }

    @Test
    fun `POST persons creates a new person`() = testApplication {
        setup()
        val dto = CreatedPersonDTO(firstName = "Jan", lastName = "Kowalski", documentNumber = "ABC123", nationality = "PL")
        coEvery { personService.createPerson(dto) } returns 1

        val response = client.post("/persons") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(CreatedPersonDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.Created, response.status)
        coVerify(exactly = 1) { personService.createPerson(dto) }
    }

    @Test
    fun `POST persons returns bad request when the service reports invalid state`() = testApplication {
        setup()
        val dto = CreatedPersonDTO(firstName = "Jan", lastName = "Kowalski", documentNumber = "ABC123", nationality = "PL")
        coEvery { personService.createPerson(dto) } throws IllegalStateException("boom")

        val response = client.post("/persons") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(CreatedPersonDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
    }

    @Test
    fun `POST persons with malformed JSON returns bad request`() = testApplication {
        setup()

        val response = client.post("/persons") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody("not-json")
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { personService.createPerson(any()) }
    }

    @Test
    fun `DELETE persons removes a person`() = testApplication {
        setup()
        coEvery { personService.deletePerson(5) } returns 1

        val response = client.delete("/persons/5") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        coVerify(exactly = 1) { personService.deletePerson(5) }
    }

    // No `else` branch is provided for a non-numeric id, so the handler never calls call.respond
    // and Ktor's routing falls back to its default "no response produced" handling (404).
    @Test
    fun `DELETE persons with a non numeric id sends no explicit response`() = testApplication {
        setup()

        val response = client.delete("/persons/abc") { testAuthHeader() }

        assertEquals(HttpStatusCode.NotFound, response.status)
        coVerify(exactly = 0) { personService.deletePerson(any()) }
    }

    @Test
    fun `PUT persons updates a person`() = testApplication {
        setup()
        val dto = UpdatePersonDTO(
            id = 5, firstName = "Jan", lastName = "Kowalski",
            documentNumber = "ABC123", nationality = "PL", status = "RESIDENT"
        )
        coEvery { personService.updatePerson(dto) } returns 1

        val response = client.put("/persons/5") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdatePersonDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { personService.updatePerson(dto) }
    }

    @Test
    fun `PUT persons returns bad request when the service reports invalid state`() = testApplication {
        setup()
        val dto = UpdatePersonDTO(
            id = 5, firstName = "Jan", lastName = "Kowalski",
            documentNumber = "ABC123", nationality = "PL", status = "RESIDENT"
        )
        coEvery { personService.updatePerson(dto) } throws IllegalStateException("boom")

        val response = client.put("/persons/5") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdatePersonDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
    }

    @Test
    fun `PUT persons with a non numeric id returns bad request`() = testApplication {
        setup()
        val dto = UpdatePersonDTO(
            id = 5, firstName = "Jan", lastName = "Kowalski",
            documentNumber = "ABC123", nationality = "PL", status = "RESIDENT"
        )

        val response = client.put("/persons/abc") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdatePersonDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { personService.updatePerson(any()) }
    }
}
