package pl.chodan.error

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.core.read.ListAppender
import io.github.smiley4.ktoropenapi.get
import io.github.smiley4.ktoropenapi.route
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.plugins.requestvalidation.*
import io.ktor.server.request.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory
import pl.chodan.testutil.installTestContentNegotiation
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import io.ktor.server.routing.get as plainGet

class ErrorHandlingTest {

    @Serializable
    private data class Payload(val value: Int)

    private class TestDomainError : ApiException(ErrorCode.ROOM_NOT_FOUND, "Nie znaleziono pokoju o id 7")

    private fun ApplicationTestBuilder.setup() {
        application {
            installTestContentNegotiation()
            configureErrorHandling {
                validate<Payload> { if (it.value > 0) ValidationResult.Valid else ValidationResult.Invalid("value: musi być dodatnie") }
            }
            routing {
                get("/declared", { errors(ErrorCode.ROOM_NOT_FOUND) }) { throw TestDomainError() }
                get("/undeclared", { errors(ErrorCode.PERSON_NOT_FOUND) }) { throw TestDomainError() }
                get("/validation") { throw ValidationException("zle", listOf("a: b")) }
                plainGet("/plain") { throw TestDomainError() }
                route("/parent", { errors(ErrorCode.ROOM_NOT_FOUND) }) {
                    get { throw TestDomainError() }
                }
                plainGet("/boom") { throw RuntimeException("secret") }
                post("/payload") { call.receive<Payload>() }
            }
        }
    }

    private suspend fun io.ktor.client.HttpClient.postPayload(body: String) =
        post("/payload") {
            contentType(ContentType.Application.Json)
            setBody(body)
        }

    private fun HttpResponse.error(text: String) = Json.decodeFromString<ApiError>(text)

    private val roomNotFound = ApiError(ErrorCode.ROOM_NOT_FOUND, "Nie znaleziono pokoju o id 7")

    @Test
    fun `ApiException maps to its code status whether or not the code is declared on the leaf route`() =
        testApplication {
            setup()
            val cases = listOf(
                Triple("/declared", HttpStatusCode.NotFound, roomNotFound),
                Triple("/validation", HttpStatusCode.BadRequest, ApiError(ErrorCode.VALIDATION_FAILED, "zle", listOf("a: b"))),
                Triple("/undeclared", HttpStatusCode.NotFound, roomNotFound),
                Triple("/plain", HttpStatusCode.NotFound, roomNotFound),
                Triple("/parent", HttpStatusCode.NotFound, roomNotFound),
            )
            for ((path, status, expected) in cases) {
                val response = client.get(path)
                assertEquals(status, response.status, path)
                assertEquals(expected, response.error(response.bodyAsText()), path)
            }
        }

    @Test
    fun `undeclared domain code is logged as WARN and declared one is not`() = testApplication {
        setup()
        val logger = LoggerFactory.getLogger("pl.chodan.error.ErrorHandling") as Logger
        val appender = ListAppender<ILoggingEvent>().apply { start() }
        logger.addAppender(appender)
        try {
            client.get("/undeclared")
            client.get("/declared")
        } finally {
            logger.detachAppender(appender)
        }

        val warnings = appender.list.filter { Level.WARN == it.level }.map { it.formattedMessage }
        assertEquals(listOf("Niezadeklarowany kod błędu ROOM_NOT_FOUND dla GET /undeclared"), warnings)
    }

    @Test
    fun `RequestValidationException maps to 400 with reasons as details`() = testApplication {
        setup()

        val response = client.postPayload("""{"value":0}""")

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val error = response.error(response.bodyAsText())
        assertEquals(ErrorCode.VALIDATION_FAILED, error.code)
        assertEquals(listOf("value: musi być dodatnie"), error.details)
    }

    @Test
    fun `malformed JSON body maps to 400 INVALID_PAYLOAD`() = testApplication {
        setup()

        val response = client.postPayload("{nope")

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(ErrorCode.INVALID_PAYLOAD, response.error(response.bodyAsText()).code)
    }

    @Test
    fun `non-JSON content type for a DTO body maps to 400 INVALID_PAYLOAD`() = testApplication {
        setup()

        val response = client.post("/payload") {
            contentType(ContentType.Text.Plain)
            setBody("value=1")
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        assertEquals(ErrorCode.INVALID_PAYLOAD, response.error(response.bodyAsText()).code)
    }

    @Test
    fun `unexpected exception maps to 500 without leaking its message`() = testApplication {
        setup()

        val response = client.get("/boom")

        val text = response.bodyAsText()
        assertEquals(HttpStatusCode.InternalServerError, response.status)
        assertEquals(ErrorCode.INTERNAL_ERROR, response.error(text).code)
        assertFalse(text.contains("secret"))
    }
}
