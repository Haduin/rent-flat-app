package pl.chodan.routing

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.NewOperationalExpenseDTO
import pl.chodan.UpdateOperationalExpenseDTO
import pl.chodan.services.ExpenseService

fun Application.configureExpenseRouting() {
    val expenseService by inject<ExpenseService>()

    routing {
        authenticate("auth-jwt") {
            route("/expenses") {
                get {
                    val apartmentId = call.request.queryParameters["apartmentId"]?.toIntOrNull()
                    val roomId = call.request.queryParameters["roomId"]?.toIntOrNull()
                    val result = expenseService.getExpenses(apartmentId, roomId)
                    call.respond(result)
                }
                post {
                    val dto = call.receive<NewOperationalExpenseDTO>()
                    try {
                        val id = expenseService.addExpense(dto)
                        call.respond(HttpStatusCode.Created, mapOf("id" to id))
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to (e.message ?: "Failed to add expense"))
                        )
                    }
                }
                put {
                    val dto = call.receive<UpdateOperationalExpenseDTO>()
                    try {
                        expenseService.updateExpense(dto)
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to (e.message ?: "Failed to update expense"))
                        )
                    }
                }
                delete("/{id}") {
                    val id = call.parameters["id"]?.toIntOrNull()
                    if (id == null) {
                        call.respond(HttpStatusCode.BadRequest, "Param 'id' is required")
                        return@delete
                    }
                    try {
                        expenseService.deleteExpense(id)
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to (e.message ?: "Failed to delete expense"))
                        )
                    }
                }
            }
        }
    }
}
