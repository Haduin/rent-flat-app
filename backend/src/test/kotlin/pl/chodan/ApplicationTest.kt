package pl.chodan

import io.ktor.client.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.testing.*
import pl.chodan.database.configureDatabases
import pl.chodan.routing.*
import kotlin.test.Test
import kotlin.test.assertEquals

class ApplicationTest {

    @Test
    fun testRoot() = testApplication {
        application {
            this@testApplication.configureServerAndGetClient()
        }
        client.get("/").apply {
            assertEquals(HttpStatusCode.OK, status)
        }
    }

}

fun ApplicationTestBuilder.configureServerAndGetClient(): HttpClient {
    application {
        configueModules()
        configureSecurity()
        configureDatabases()
        configureApartmentRouting()
        configurePersonRouting()
        configureRoomRouting()
        configureContractRouting()
        configurePaymentRouting()

    }
    val client = createClient {
        this@configureServerAndGetClient.install(ContentNegotiation) {
            json()
        }
    }
    return client
}