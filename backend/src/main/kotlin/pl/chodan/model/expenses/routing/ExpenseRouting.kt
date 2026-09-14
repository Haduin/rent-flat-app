package pl.chodan.model.expenses.routing

import io.github.smiley4.ktoropenapi.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.model.expenses.dto.ExpenseConfirmationDTO
import pl.chodan.model.expenses.dto.NewOperationalExpenseDTO
import pl.chodan.model.expenses.dto.OperationalExpenseDTO
import pl.chodan.model.expenses.dto.UpdateOperationalExpenseDTO
import pl.chodan.model.expenses.service.ExpenseService
import pl.chodan.ultis.YearMonthString

fun Application.configureExpenseRouting() {
    val expenseService by inject<ExpenseService>()

    routing {
        authenticate("auth-jwt") {
            route("/expenses", {
                tags = listOf("Expenses")
            }) {
                get({
                    description = "Get expenses with optional filters"
                    operationId = "getExpenses"
                    request {
                        queryParameter<String>("yearMonth") {
                            description = "Year and month in format YYYY-MM"; required = true
                        }
                        queryParameter<Int>("apartmentId") { description = "Filter by apartment id"; required = false }
                        queryParameter<Int>("roomId") { description = "Filter by room id"; required = false }
                    }
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Returns list of expenses"
                            body<List<OperationalExpenseDTO>>()
                        }
                    }
                }) {
                    val yearMonth = YearMonthString.parse(call.request.queryParameters["yearMonth"])
                    val apartmentId = call.request.queryParameters["apartmentId"]?.toIntOrNull()
                    val roomId = call.request.queryParameters["roomId"]?.toIntOrNull()
                    val result = expenseService.getExpenses(yearMonth, apartmentId, roomId)
                    call.respond(result)
                }
                post({
                    description = "Create a new operational expense"
                    operationId = "createExpense"
                    request { body<NewOperationalExpenseDTO> { description = "Expense payload" } }
                    response {
                        code(HttpStatusCode.Created) {
                            description = "Expense created"
                            body<Int>()
                        }
                        code(HttpStatusCode.BadRequest) { description = "Invalid payload" }
                    }
                }) {
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
                put({
                    description = "Update an operational expense"
                    operationId = "updateExpense"
                    request { body<UpdateOperationalExpenseDTO> { description = "Expense update payload" } }
                    response {
                        code(HttpStatusCode.OK) { description = "Expense updated" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid update data" }
                    }
                }) {
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
                post("/confirm", {
                    description = "Confirm an operational expense as paid"
                    operationId = "confirmExpense"
                    request { body<ExpenseConfirmationDTO> { description = "Expense confirmation payload" } }
                    response {
                        code(HttpStatusCode.OK) { description = "Expense confirmed" }
                        code(HttpStatusCode.BadRequest) { description = "Confirmation failed" }
                    }
                }) {
                    val request = call.receive<ExpenseConfirmationDTO>()
                    try {
                        expenseService.confirmExpense(request)
                        call.respond(HttpStatusCode.OK, mapOf("message" to "Expense confirmed successfully"))
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.BadRequest, mapOf("error" to "Failed to confirm expense: ${e.message}")
                        )
                    }
                }
                post("/generate", {
                    description = "Generate monthly expenses based on templates"
                    operationId = "generateExpensesFromTemplates"
                    request {
                        queryParameter<String>("yearMonth") {
                            description = "Year and month in format YYYY-MM"
                            required = true
                        }
                    }
                    response {
                        code(HttpStatusCode.OK) { description = "Expenses generated" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid or missing parameters" }
                    }
                }) {
                    val yearMonth = call.request.queryParameters["yearMonth"]
                    if (yearMonth.isNullOrBlank()) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing yearMonth (YYYY-MM)"))
                        return@post
                    }

                    try {
                        expenseService.generateMonthlyExpenses(yearMonth)
                        call.respond(
                            HttpStatusCode.OK
                        )
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to (e.message ?: "Failed to generate expenses"))
                        )
                    }
                }

                delete("/{id}", {
                    description = "Delete an operational expense"
                    operationId = "deleteExpense"
                    request { pathParameter<Int>("id") { description = "Expense id" } }
                    response {
                        code(HttpStatusCode.OK) { description = "Expense deleted" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid id" }
                    }
                }) {
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
