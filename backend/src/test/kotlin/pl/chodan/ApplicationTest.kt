package pl.chodan

import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.testing.*
import kotlin.test.Test
import kotlin.test.assertEquals

class ApplicationTest {

    @Test
    fun testRoot() = testApplication {
        application {
            main()
        }
        val client = createClient {
            this@testApplication.install(ContentNegotiation) {
                json()
            }
        }

        client.get("/apartments").apply {
            assertEquals(HttpStatusCode.OK, status)
        }
    }

}
