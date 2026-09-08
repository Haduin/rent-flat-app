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
import pl.chodan.model.expenses.dto.AddExpenseTemplateRequest
import pl.chodan.model.expenses.dto.OperationalExpenseTemplateResponse
import pl.chodan.model.expenses.dto.UpdateExpenseTemplate
import pl.chodan.model.expenses.service.ExpenseTemplateService

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
                    request { body<AddExpenseTemplateRequest> { description = "Expense template payload" } }
                    response { code(Created) { description = "Template created" } }
                }) {

                    val request = call.receive<AddExpenseTemplateRequest>()

                    expenseTemplateService.createExpenseTemplate(request)

                    call.respond(
                        Created, mapOf("message" to "Expense template created successfully")
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
                    val response = expenseTemplateService.findAll()
                    response.isNotEmpty().let {
                        call.respond(response)
                    }
                }

                put("/{expenseTemplateId}", {
                    description = "Updates an existing expense template"
                    operationId = "updateExpenseTemplate"
                    request {
                        pathParameter<Int>("expenseTemplateId") { description = "Expense template id" }
                        body<UpdateExpenseTemplate>()
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Template updated" }
                        code(HttpStatusCode.NotFound) { description = "Expense template not found" }
                    }
                }) {
                    val id = call.parameters["expenseTemplateId"]?.toIntOrNull()
                    if (id == null) {
                        call.respond(HttpStatusCode.NotFound)
                        return@put
                    }

                    val request = call.receive<UpdateExpenseTemplate>()
                    expenseTemplateService.updateExpenseTemplate(id, request)
                    call.respond(HttpStatusCode.NoContent)
                }
                delete("/{expenseTemplateId}", {
                    operationId = "deleteExpenseTemplate"
                    description = "Deletes an existing expense template"
                    request {
                        pathParameter<Int>("expenseTemplateId") { description = "Expense template id" }
                    }
                    response {
                        code(HttpStatusCode.OK) { description = "Template deleted" }
                        code(HttpStatusCode.NotFound) { description = "Expense template not found" }
                    }
                }) {
                    val id = call.parameters["expenseTemplateId"]?.toIntOrNull()
                    if (id == null) {
                        call.respond(HttpStatusCode.NotFound)
                        return@delete
                    }

                    expenseTemplateService.deleteExpenseTemplate(id)
                    call.respond(HttpStatusCode.OK)
                }

            }
        }


    }
}