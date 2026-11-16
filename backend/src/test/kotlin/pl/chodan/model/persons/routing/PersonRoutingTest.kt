package pl.chodan.model.persons.routing

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
import pl.chodan.model.persons.dto.CreatedPersonDTO
import pl.chodan.model.persons.dto.PersonDTO
import pl.chodan.model.persons.dto.UpdatePersonDTO
import pl.chodan.model.persons.service.PersonError
import pl.chodan.model.persons.service.PersonService
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

class PersonRoutingTest {

    private val personService = mockk<PersonService>()

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module { single { personService } })
        application {
            installTestContentNegotiation()
            installTestErrorHandling()
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
        assertEquals(1, Json.parseToJsonElement(response.bodyAsText()).jsonObject["id"]?.jsonPrimitive?.int)
        coVerify(exactly = 1) { personService.createPerson(dto) }
    }

    @Test
    fun `POST persons with a blank name returns validation details`() = testApplication {
        setup()
        val dto = CreatedPersonDTO(firstName = " ", lastName = "Kowalski", documentNumber = "ABC123", nationality = "PL")

        val response = client.post("/persons") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(CreatedPersonDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(listOf("firstName: imię jest wymagane"), Json.decodeFromString<ApiError>(response.bodyAsText()).details)
        coVerify(exactly = 0) { personService.createPerson(any()) }
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
        assertEquals(ErrorCode.INVALID_PAYLOAD, Json.decodeFromString<ApiError>(response.bodyAsText()).code)
        coVerify(exactly = 0) { personService.createPerson(any()) }
    }

    @Test
    fun `DELETE persons removes a person`() = testApplication {
        setup()
        coEvery { personService.deletePerson(5) } returns Unit

        val response = client.delete("/persons/5") { testAuthHeader() }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { personService.deletePerson(5) }
    }

    @Test
    fun `DELETE persons with a non numeric id returns bad request`() = testApplication {
        setup()

        val response = client.delete("/persons/abc") { testAuthHeader() }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { personService.deletePerson(any()) }
    }


    @Test
    fun `PUT persons takes the person id from the path`() = testApplication {
        setup()
        val dto = UpdatePersonDTO(
            firstName = "Jan", lastName = "Kowalski",
            documentNumber = "ABC123", nationality = "PL", status = "RESIDENT"
        )
        coEvery { personService.updatePerson(1, dto) } returns Unit

        val response = client.put("/persons/1") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdatePersonDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.NoContent, response.status)
        coVerify(exactly = 1) { personService.updatePerson(1, dto) }
    }


    @Test
    fun `PUT persons with a non numeric id returns bad request`() = testApplication {
        setup()
        val dto = UpdatePersonDTO(
            firstName = "Jan", lastName = "Kowalski",
            documentNumber = "ABC123", nationality = "PL", status = "RESIDENT"
        )

        val response = client.put("/persons/abc") {
            testAuthHeader()
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(UpdatePersonDTO.serializer(), dto))
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        coVerify(exactly = 0) { personService.updatePerson(any(), any()) }
    }

    @Test
    fun `domain errors of each endpoint map to their status and code`() = testApplication {
        setup()
        coEvery { personService.updatePerson(99, any()) } throws PersonError.NotFound(99)
        coEvery { personService.deletePerson(99) } throws PersonError.NotFound(99)
        coEvery { personService.deletePerson(8) } throws PersonError.InUse()
        val body = Json.encodeToString(
            UpdatePersonDTO.serializer(),
            UpdatePersonDTO(firstName = "Jan", lastName = "Kowalski", documentNumber = "ABC123", nationality = "PL", status = "RESIDENT")
        )
        val cases = listOf(
            Triple(HttpMethod.Put, "/persons/99", ErrorCode.PERSON_NOT_FOUND),
            Triple(HttpMethod.Delete, "/persons/99", ErrorCode.PERSON_NOT_FOUND),
            Triple(HttpMethod.Delete, "/persons/8", ErrorCode.PERSON_IN_USE),
        )

        for ((method, path, code) in cases) {
            val response = client.request(path) {
                this.method = method
                testAuthHeader()
                contentType(ContentType.Application.Json)
                setBody(body)
            }
            assertEquals(code.status, response.status, "$method $path")
            assertEquals(code, Json.decodeFromString<ApiError>(response.bodyAsText()).code, "$method $path")
        }
    }
}
