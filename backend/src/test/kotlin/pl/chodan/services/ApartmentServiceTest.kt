package pl.chodan.services

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.testing.*
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.Schema
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.TestInstance
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import pl.chodan.ApartmentAndRoomNumberDTO
import pl.chodan.config.*
import pl.chodan.configureModules
import pl.chodan.database.*
import pl.chodan.routing.configureApartmentRouting
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.testing.*
import kotlin.test.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import pl.chodan.main
import kotlin.test.*

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ApartmentRoutesTest {

    private val mockApartmentService = mockk<ApartmentService>()

    private val postgres = TestPostgresContainer().apply {
        withDatabaseName("testdb")
        withUsername("test")
        withPassword("test")
        start()
    }

    @BeforeAll
    fun setupDatabase() {
        Database.connect(
            url = postgres.jdbcUrl,
            driver = "org.postgresql.Driver",
            user = postgres.username,
            password = postgres.password
        )

        transaction {
            val schema = Schema("flat")
            SchemaUtils.createSchema(schema)
            SchemaUtils.setSchema(schema)
            SchemaUtils.create(Apartment, Room, Person, Contract, Payment, UtilityCosts)
        }
    }

    @AfterAll
    fun tearDown() {
        postgres.stop()
    }

    @BeforeEach
    fun cleanDb() {
        transaction {
            Apartment.deleteAll()
        }
    }

    @Test
    fun `GET apartments should return list of apartments`() = testApplication {
        // Nadpisujemy domyślne moduły Koin testowym mockiem
        application {
            // Załaduj tylko potrzebny routing + zależności
            install(Koin) {
                modules(
                    module {
                        single { mockApartmentService }
                        // dodaj inne mocki jeśli potrzebujesz (np. config)
                        single<Config> {
                            Config(
                                keycloak = KeycloakConfig(
                                    url = "mock",
                                    realm = "test",
                                    clientId = "mockId",
                                    tokenPath = "tokenPath"
                                ),
                                ktor = KtorConfig(
                                    cors = CorsConfig(allowedHosts = listOf("*")),
                                    database = DatabaseConfig(
                                        url = postgres.jdbcUrl,
                                        user = postgres.username,
                                        password = postgres.password,
                                        driver = "org.postgresql.Driver",
                                    )
                                )
                            )
                        }
                    }
                )
            }

            // Instalujemy minimalny setup aplikacji (bez pełnego modułu)
            configureModules()
            configureApartmentRouting()
        }



        val expectedResponse = listOf(
            ApartmentAndRoomNumberDTO(
                apartmentName = "Test1",
                roomName = "3"
            )
        )

        coEvery { mockApartmentService.getAllApartmentsWithRoomDetails() } returns expectedResponse


        val response = client.get("/apartments") {
            header(HttpHeaders.Authorization, "Bearer faketoken") // jeśli wymagany
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        val decoded = Json.decodeFromString<List<ApartmentAndRoomNumberDTO>>(body)

        assertEquals(expectedResponse, decoded)
    }
}