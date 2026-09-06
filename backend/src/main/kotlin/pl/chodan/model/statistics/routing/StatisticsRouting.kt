package pl.chodan.model.statistics.routing

import io.github.smiley4.ktoropenapi.get
import io.github.smiley4.ktoropenapi.route
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.model.statistics.dto.ApartmentsStatisticsResponse
import pl.chodan.model.statistics.service.StatisticsService

fun Application.configureStatisticsRouting() {

    val statisticsService by inject<StatisticsService>()

    routing {
        authenticate("auth-jwt") {
            route("/statistics", {
                tags = listOf("Statistics")
            }) {
                get("/apartments", {
                    description = "Get aggregated per-apartment statistics (occupancy, rent, income, costs) plus a portfolio-wide overview"
                    operationId = "getApartmentsStatistics"
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Returns per-apartment statistics and an overall overview"
                            body<ApartmentsStatisticsResponse>()
                        }
                    }
                }) {
                    call.respond(statisticsService.getApartmentsStatistics())
                }
            }
        }
    }
}
