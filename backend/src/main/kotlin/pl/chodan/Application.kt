package pl.chodan

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import org.koin.core.context.startKoin
import org.koin.core.module.dsl.singleOf
import org.koin.dsl.module
import pl.chodan.config.*
import pl.chodan.database.DatabaseProvider
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.routing.*
import pl.chodan.services.*

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    val config = createConfigFromYaml(environment)

    startKoin {
        modules(appModule(config))
    }

    configureModules()

    configureApartmentRouting()
    configurePersonRouting()
    configureRoomRouting()
    configureContractRouting()
    configurePaymentRouting()

}

val appModule = { config: Config ->
    module {
        single<Config> { config }
        single<DatabaseProviderContract> { DatabaseProvider() }

        // Services
        singleOf(::ApartmentService)
        singleOf(::PersonService)
        singleOf(::RoomService)
        singleOf(::ContractService)
        singleOf(::PaymentService)

    }
}

fun createConfigFromYaml(environment: ApplicationEnvironment): Config {
    return Config(
        ktor = KtorConfig(
            database = DatabaseConfig(
                url = environment.config.property("ktor.database.url").getString(),
                user = environment.config.property("ktor.database.user").getString(),
                password = environment.config.property("ktor.database.password").getString(),
                driver = environment.config.property("ktor.database.driver").getString()
            ),
            cors = CorsConfig(
                allowedHosts = environment.config.property("ktor.cors.allowedHosts")
                    .getString()
                    .split(",")
                    .map { it.trim() }
            )
        ),
        keycloak = KeycloakConfig(
            url = environment.config.property("keycloak.url").getString(),
            clientId = environment.config.property("keycloak.clientId").getString(),
            realm = environment.config.property("keycloak.realm").getString(),
            tokenPath = environment.config.property("keycloak.tokenPath").getString()
        )
    )
}
