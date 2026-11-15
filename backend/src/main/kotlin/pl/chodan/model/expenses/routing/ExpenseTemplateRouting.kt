package pl.chodan.model.expenses.routing

import io.github.smiley4.ktoropenapi.delete
import io.github.smiley4.ktoropenapi.get
import io.github.smiley4.ktoropenapi.post
import io.github.smiley4.ktoropenapi.put
import io.github.smiley4.ktoropenapi.route
import io.ktor.http.*
import io.ktor.http.HttpStatusCode.Companion.Created
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.error.ErrorCode
import pl.chodan.error.errors
import pl.chodan.error.intParam
import pl.chodan.model.expenses.dto.AddExpenseTemplateRequest
import pl.chodan.model.expenses.dto.OperationalExpenseTemplateResponse
import pl.chodan.model.expenses.dto.UpdateExpenseTemplate
import pl.chodan.model.expenses.service.ExpenseTemplateService
import pl.chodan.routing.IdResponse

fun Application.configureExpenseTemplateRouting() {
    val expenseTemplateService by inject<ExpenseTemplateService>()

    routing {
        authenticate("auth-jwt") {
            route("/expense-template", {
                tags = listOf("Expense templates")
            }) {

                post({
                    description = "Create a new expense template"
                    operationId = "createExpenseTemplate"
                    errors(
                        ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD,
                        ErrorCode.APARTMENT_NOT_FOUND, ErrorCode.ROOM_NOT_FOUND
                    )
                    request { body<AddExpenseTemplateRequest> { description = "Expense template payload" } }
                    response {
                        code(Created) {
                            description = "Template created"
                            body<IdResponse>()
                        }
                    }
                }) {
                    call.respond(
                        Created,
                        IdResponse(expenseTemplateService.createExpenseTemplate(call.receive<AddExpenseTemplateRequest>()))
                    )
                }

                get({
                    description = "Get all expense templates"
                    operationId = "getExpenseTemplates"
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Templates returned"
                            body<List<OperationalExpenseTemplateResponse>>()
                        }
                    }
                }) {
                    call.respond(expenseTemplateService.findAll())
                }

                put("/{expenseTemplateId}", {
                    description = "Updates an existing expense template"
                    operationId = "updateExpenseTemplate"
                    errors(
                        ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD, ErrorCode.EXPENSE_TEMPLATE_NOT_FOUND,
                        ErrorCode.EXPENSE_TEMPLATE_INACTIVE, ErrorCode.APARTMENT_NOT_FOUND, ErrorCode.ROOM_NOT_FOUND
                    )
                    request {
                        pathParameter<Int>("expenseTemplateId") { description = "Expense template id" }
                        body<UpdateExpenseTemplate>()
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Template updated" }
                    }
                }) {
                    expenseTemplateService.updateExpenseTemplate(
                        call.intParam("expenseTemplateId"),
                        call.receive<UpdateExpenseTemplate>()
                    )
                    call.respond(HttpStatusCode.NoContent)
                }
                delete("/{expenseTemplateId}", {
                    operationId = "deleteExpenseTemplate"
                    description = "Deletes an existing expense template"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.EXPENSE_TEMPLATE_NOT_FOUND)
                    request {
                        pathParameter<Int>("expenseTemplateId") { description = "Expense template id" }
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Template deleted" }
                    }
                }) {
                    expenseTemplateService.deleteExpenseTemplate(call.intParam("expenseTemplateId"))
                    call.respond(HttpStatusCode.NoContent)
                }

            }
        }


    }
}