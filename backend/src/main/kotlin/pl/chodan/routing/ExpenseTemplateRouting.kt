package pl.chodan.routing

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.services.ExpenseTemplateService

fun Application.configureExpenseTemplateRouting() {
    val expenseTemplateService by inject<ExpenseTemplateService>()

    routing {
        authenticate("auth-jwt") {
            route("/expense-templates") {
                post("/generate") {
                    val yearMonth = call.request.queryParameters["yearMonth"]
                    if (yearMonth.isNullOrBlank()) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing yearMonth (YYYY-MM)"))
                        return@post
                    }

                    try {
                        val result = expenseTemplateService.generateMonthlyExpenses(yearMonth)
                        call.respond(HttpStatusCode.OK, mapOf("created" to result.created, "createdIds" to result.createdIds))
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Failed to generate expenses")))
                    }
                }
            }
        }
    }
}