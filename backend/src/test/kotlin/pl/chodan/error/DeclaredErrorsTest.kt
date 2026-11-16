package pl.chodan.error

import io.github.smiley4.ktoropenapi.get
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.server.auth.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import pl.chodan.configureOpenAPI
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse

class DeclaredErrorsTest {

    private suspend fun ApplicationTestBuilder.openApiSpec(): JsonObject {
        application {
            installTestContentNegotiation()
            installTestAuthentication()
            configureOpenAPI()
            routing {
                authenticate("auth-jwt") {
                    get("/rooms/{id}", {
                        operationId = "testOperation"
                        errors(ErrorCode.APARTMENT_NOT_FOUND, ErrorCode.ROOM_NOT_FOUND, ErrorCode.ROOM_IN_USE)
                    }) {}
                }
            }
        }
        return Json.parseToJsonElement(client.get("/openapi.json").bodyAsText()).jsonObject
    }

    @Test
    fun `errors groups declared codes by status and protected routes get 401`() = testApplication {
        val responses = openApiSpec()["paths"]!!.jsonObject["/rooms/{id}"]!!.jsonObject["get"]!!
            .jsonObject["responses"]!!.jsonObject

        fun description(status: String) = responses[status]!!.jsonObject["description"]!!.jsonPrimitive.content

        assertEquals("APARTMENT_NOT_FOUND, ROOM_NOT_FOUND", description("404"))
        assertEquals("ROOM_IN_USE", description("409"))
        assertEquals("UNAUTHORIZED", description("401"))
    }

    @Test
    fun `ErrorCode schema is a plain enum without the status property`() = testApplication {
        val schema = openApiSpec()["components"]!!.jsonObject["schemas"]!!.jsonObject["ErrorCode"]!!.jsonObject

        assertEquals(ErrorCode.entries.map { it.name }, schema["enum"]!!.jsonArray.map { it.jsonPrimitive.content })
        assertFalse(schema.containsKey("properties"))
    }
}
