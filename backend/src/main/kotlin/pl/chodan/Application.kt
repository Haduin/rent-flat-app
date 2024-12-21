package pl.chodan

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
    configueModules()
}

fun Application.configueModules() {
    install(CORS) {
        anyHost()
    }
    install(ContentNegotiation) {
        json()
    }
}
