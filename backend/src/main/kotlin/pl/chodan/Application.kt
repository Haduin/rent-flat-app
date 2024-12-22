package pl.chodan

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureDatabases()
    configureApartmentRouting()
    configurePersonRouting()
    configureContractRouting()
    configurePaymentRouting()
    configueModules()
}

fun Application.configueModules() {
    install(CORS) {
        anyHost()
        allowHeader(HttpHeaders.ContentType) // Pozwól na nagłówek Content-Type
        allowHeader(HttpHeaders.Authorization) // Pozwól na nagłówek Authorization (opcjonalnie)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Options)
    }
    install(ContentNegotiation) {
        json()
    }
}
