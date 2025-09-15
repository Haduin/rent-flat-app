package pl.chodan.routing

import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.services.DashboardService

fun Application.configureDashboardRouting() {
    val dashboardService by inject<DashboardService>()
    
    routing {
        authenticate("auth-jwt") {
            route("/dashboard") {
                get("/{timeRange}") {
                    val timeRange = call.parameters["timeRange"] ?: "6m"
                    call.respond(dashboardService.getDashboardData(timeRange))
                }
            }
        }
    }
}