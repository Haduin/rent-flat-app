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
}

fun Application.configueModules() {
    
    val allowedHosts = environment.config.property("ktor.cors.allowedHosts").getString().split(",").map { it.trim() }
    allowedHosts.forEach { println(it) }
    install(CORS) {
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.AccessControlAllowOrigin)
        allowHeader(HttpHeaders.AccessControlAllowHeaders)

        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Options)

        allowNonSimpleContentTypes = true
        allowCredentials = true
        allowSameOrigin = true

        allowedHosts.forEach { allowHost(it, schemes = listOf("http")) }


    }
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
        })
    }
    install(CallLogging) {
        level = Level.INFO
    }


}

fun Application.configureSecurity() {
    val keycloakAddress = environment.config.property("keycloak.url").getString()
    val clientId = environment.config.property("keycloak.clientId").getString()
    val realm = environment.config.property("keycloak.realm").getString()


    install(Authentication) {
        jwt("auth-jwt") {
            verifier(
                JwkProviderBuilder(URL("${keycloakAddress}/realms/${realm}/protocol/openid-connect/certs"))
                    .build()
            )
            validate { credential ->
                if (credential.payload.getClaim("preferred_username").asString() != null) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
        }
    }
//    routing {
//        post("/login") {
//            val request = call.receive<LoginRequest>()
//            val token = login(request.username, request.password)
//            if (token != null) {
//                call.respond(mapOf("access_token" to token))
//            } else {
//                call.respondText("Invalid credentials", status = HttpStatusCode.Unauthorized)
//            }
//        }
//    }
}
