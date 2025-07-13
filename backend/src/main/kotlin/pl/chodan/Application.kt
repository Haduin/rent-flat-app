package pl.chodan

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.engine.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.response.*
import kotlinx.serialization.json.Json
import org.koin.core.context.startKoin
import org.slf4j.LoggerFactory
import org.slf4j.event.Level
import pl.chodan.context.KtorUserDetailsPrincipal
import pl.chodan.context.UserDetails
import pl.chodan.database.configureDatabases
import pl.chodan.routing.*
import java.net.URL

fun main() {
    embeddedServer(io.ktor.server.netty.Netty, port = 8080, host = "0.0.0.0", module = Application::module)
}

fun Application.module() {
    startKoin {
        configueModules()
        configureSecurity()
        configureDatabases()

//    configureUtilityRouting()
        configureApartmentRouting()
        configurePersonRouting()
        configureRoomRouting()
        configureContractRouting()
        configurePaymentRouting()
    }
}

fun Application.configueModules() {

    val allowedHosts = environment.config.property("ktor.cors.allowedHosts").getString().split(",").map { it.trim() }
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

        allowedHosts.forEach { allowHost(it) }


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
    val logger = LoggerFactory.getLogger(Application::class.java)

    install(Authentication) {
        jwt("auth-jwt") {
            verifier(
                JwkProviderBuilder(URL("${keycloakAddress}/realms/${realm}/protocol/openid-connect/certs"))
                    .build(),
                issuer = "${keycloakAddress}/realms/${realm}",
            )
            validate { credential ->
                try {
                    val username = credential.payload.getClaim("preferred_username").asString()
                    val email = credential.payload.getClaim("email")?.asString()
                    val roles = credential.payload.getClaim("realm_access")?.asMap()?.get("roles") as? List<String>
                        ?: emptyList()

                    if (username != null) {
                        val userDetails = UserDetails(
                            username = username,
                            email = email,
                            roles = roles,
                            isAuthenticated = true
                        )
                        KtorUserDetailsPrincipal(userDetails)
                    } else {
                        logger.warn("Brak preferred_username w tokenie JWT dla '${credential.payload.subject}'")
                        null
                    }
                } catch (e: Exception) {
                    logger.error(
                        "Błąd walidacji tokenu JWT: ${e.message}",
                        e
                    )
                    null
                }
            }

            challenge { defaultScheme, realm ->
                call.respond(HttpStatusCode.Unauthorized, "Token is not valid or has expired")
            }
        }
    }
}
