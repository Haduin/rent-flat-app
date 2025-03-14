package pl.chodan

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.slf4j.event.Level
import java.net.URL

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configueModules()
    configureSecurity()
    configureDatabases()
    configureApartmentRouting()
    configurePersonRouting()
    configureRoomRouting()
    configureContractRouting()
    configurePaymentRouting()

//    configureScheduler()
}

fun Application.configueModules() {
    install(CORS) {
//        anyHost()
        allowHost("localhost:5173")
        allowHost("localhost:8080")
        allowHost("localhost:8081")
        allowCredentials = true
        // Pozwól na nagłówki
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.AccessControlAllowOrigin)

        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Options)
        // Zezwolenie na credentials (ważne dla CORS z tokenem)

        // Pozwól na zapytania z lokalnego frontendu

        allowNonSimpleContentTypes = true
        allowCredentials = true
        allowSameOrigin = true


    }
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true // Ignoruje nieznane pola, możesz zmodyfikować wedle potrzeb
        })
    }
    install(CallLogging) {
        level = Level.INFO
    }


}

fun Application.configureSecurity() {
    val keycloakAddress = "http://localhost:8081"
    val clientId = "mieszkanie_client_id"
    val realm = "mieszkania_realm"


    install(Authentication) {
        jwt("auth-jwt") {
            verifier(
                JwkProviderBuilder(URL("${keycloakAddress}/realms/${realm}/protocol/openid-connect/certs"))
                    .build()
            )
            validate { credential ->
                println("Token: $credential")
                if (credential.payload.getClaim("preferred_username").asString() != null) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
        }
    }
    routing {
        post("/login") {
            val request = call.receive<LoginRequest>()
            val token = login(request.username, request.password)
            if (token != null) {
                call.respond(mapOf("access_token" to token))
            } else {
                call.respondText("Invalid credentials", status = io.ktor.http.HttpStatusCode.Unauthorized)
            }
        }
    }
}

@Serializable
data class LoginRequest(val username: String, val password: String)