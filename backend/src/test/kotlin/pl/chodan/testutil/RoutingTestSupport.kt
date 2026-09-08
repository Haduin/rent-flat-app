package pl.chodan.testutil

import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.plugins.contentnegotiation.*
import kotlinx.serialization.json.Json
import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin
import org.koin.core.module.Module
import java.util.Base64

/**
 * Routes under test are protected with `authenticate("auth-jwt")`. The real provider verifies
 * tokens against Keycloak, which isn't reachable in unit tests, so this registers a stub
 * provider under the same name that accepts any Basic credentials.
 */
fun Application.installTestAuthentication() {
    install(Authentication) {
        basic("auth-jwt") {
            validate { UserIdPrincipal(it.name) }
        }
    }
}

fun Application.installTestContentNegotiation() {
    install(ContentNegotiation) {
        json(Json { ignoreUnknownKeys = true })
    }
}

/** Routing files resolve services via the global Koin context, mirroring production's `startKoin { ... }`. */
fun startTestKoin(vararg modules: Module) {
    stopTestKoin()
    startKoin { modules(modules.toList()) }
}

fun stopTestKoin() {
    try {
        stopKoin()
    } catch (_: IllegalStateException) {
    }
}

fun HttpRequestBuilder.testAuthHeader() {
    val token = Base64.getEncoder().encodeToString("test:test".toByteArray())
    header(HttpHeaders.Authorization, "Basic $token")
}
