package pl.chodan.model.expenses.routing

import io.github.smiley4.ktoropenapi.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.error.ErrorCode
import pl.chodan.error.errors
import pl.chodan.error.intParam
import pl.chodan.error.optionalIntQuery
import pl.chodan.error.yearMonthQuery
import pl.chodan.model.expenses.dto.ExpenseConfirmationDTO
import pl.chodan.model.expenses.dto.NewOperationalExpenseDTO
import pl.chodan.model.expenses.dto.OperationalExpenseDTO
import pl.chodan.model.expenses.dto.UpdateOperationalExpenseDTO
import pl.chodan.model.expenses.service.ExpenseService
import pl.chodan.routing.IdResponse

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
                    errors(ErrorCode.VALIDATION_FAILED)
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
                    call.respond(
                        expenseService.getExpenses(
                            call.yearMonthQuery(),
                            call.optionalIntQuery("apartmentId"),
                            call.optionalIntQuery("roomId")
                        )
                    )
                }
                post({
                    description = "Create a new operational expense"
                    operationId = "createExpense"
                    errors(
                        ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD, ErrorCode.APARTMENT_NOT_FOUND,
                        ErrorCode.ROOM_NOT_FOUND, ErrorCode.EXPENSE_TEMPLATE_NOT_FOUND, ErrorCode.EXPENSE_ALREADY_GENERATED
                    )
                    request { body<NewOperationalExpenseDTO> { description = "Expense payload" } }
                    response {
                        code(HttpStatusCode.Created) {
                            description = "Expense created"
                            body<IdResponse>()
                        }
                    }
                }) {
                    val id = expenseService.addExpense(call.receive<NewOperationalExpenseDTO>())
                    call.respond(HttpStatusCode.Created, IdResponse(id))
                }
                put({
                    description = "Update an operational expense"
                    operationId = "updateExpense"
                    errors(
                        ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD,
                        ErrorCode.EXPENSE_NOT_FOUND, ErrorCode.EXPENSE_ALREADY_GENERATED
                    )
                    request { body<UpdateOperationalExpenseDTO> { description = "Expense update payload" } }
                    response { code(HttpStatusCode.NoContent) { description = "Expense updated" } }
                }) {
                    expenseService.updateExpense(call.receive<UpdateOperationalExpenseDTO>())
                    call.respond(HttpStatusCode.NoContent)
                }
                post("/confirm", {
                    description = "Confirm an operational expense as paid"
                    operationId = "confirmExpense"
                    errors(
                        ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD,
                        ErrorCode.EXPENSE_NOT_FOUND, ErrorCode.EXPENSE_NOT_CONFIRMABLE
                    )
                    request { body<ExpenseConfirmationDTO> { description = "Expense confirmation payload" } }
                    response { code(HttpStatusCode.NoContent) { description = "Expense confirmed" } }
                }) {
                    expenseService.confirmExpense(call.receive<ExpenseConfirmationDTO>())
                    call.respond(HttpStatusCode.NoContent)
                }
                post("/generate", {
                    description = "Generate monthly expenses based on templates"
                    operationId = "generateExpensesFromTemplates"
                    errors(ErrorCode.VALIDATION_FAILED)
                    request {
                        queryParameter<String>("yearMonth") {
                            description = "Year and month in format YYYY-MM"
                            required = true
                        }
                    }
                    response { code(HttpStatusCode.NoContent) { description = "Expenses generated" } }
                }) {
                    expenseService.generateMonthlyExpenses(call.yearMonthQuery().value)
                    call.respond(HttpStatusCode.NoContent)
                }

                delete("/{id}", {
                    description = "Delete an operational expense"
                    operationId = "deleteExpense"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.EXPENSE_NOT_FOUND)
                    request { pathParameter<Int>("id") { description = "Expense id" } }
                    response { code(HttpStatusCode.NoContent) { description = "Expense deleted" } }
                }) {
                    expenseService.deleteExpense(call.intParam("id"))
                    call.respond(HttpStatusCode.NoContent)
                }
            }
        }
    }
}
