package pl.chodan.model.payments.routing

import io.github.smiley4.ktoropenapi.get
import io.github.smiley4.ktoropenapi.post
import io.github.smiley4.ktoropenapi.put
import io.github.smiley4.ktoropenapi.route
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.model.payments.dto.PaymentEdit
import pl.chodan.model.payments.dto.PaymentHistoryWithPersonDTO
import pl.chodan.model.payments.service.PaymentService
import pl.chodan.model.perons.dto.PaymentConfirmationDTO
import pl.chodan.routing.SortOrder

fun Application.configurePaymentRouting() {
    val paymentService by inject<PaymentService>()
    routing {
        authenticate("auth-jwt") {
            route("/payments", {
                tags = listOf("Payments")
            }) {
                get({
                    description = "Get all payments"
                    operationId = "getAllPayments"
                    response { code(HttpStatusCode.OK) { description = "Returns all payments" } }
                }) {
                    call.respond(paymentService.getAllPayments())
                }
                get("/{mouth}", {
                    description = "Get payments for given month with sorting"
                    operationId = "getPaymentsForMonth"
                    request {
                        pathParameter<String>("mouth") { description = "Month in format YYYY-MM" }
                        queryParameter<PaymentSortableField>("sortField") {
                            description = "Sort field (ID, PERSON, FLAT, DATE, AMOUNT, STATUS)"
                            required = false
                        }
                        queryParameter<SortOrder>("sortOrder") {
                            description = "Sort order (ASC, DESC)"
                            required = false
                        }
                    }
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Payments for month"
                            body<List<PaymentHistoryWithPersonDTO>>()
                        }
                        code(HttpStatusCode.BadRequest) { description = "Invalid parameters" }
                    }
                }) {
                    call.parameters["mouth"]?.let { mouth ->
                        val sortFieldName =
                            call.request.queryParameters["sortField"]?.let { PaymentSortableField.valueOf(it) }
                                ?: PaymentSortableField.ID
                        val sortOrder =
                            call.request.queryParameters["sortOrder"]?.let { SortOrder.valueOf(it) } ?: SortOrder.ASC

                        val response = paymentService.getPaymentsForMouth(mouth, sortFieldName, sortOrder)
                        call.respond(response)
                    } ?: call.respond(HttpStatusCode.BadRequest, "Mouth parameter is required")

                }
                post("/confirm", {
                    description = "Confirm a payment"
                    operationId = "confirmPayment"
                    request { body<PaymentConfirmationDTO> { description = "Payment confirmation payload" } }
                    response {
                        code(HttpStatusCode.OK) { description = "Payment confirmed" }
                        code(HttpStatusCode.BadRequest) { description = "Confirmation failed" }
                    }
                }) {
                    val request = call.receive<PaymentConfirmationDTO>()
                    try {
                        PaymentService().confirmPayment(request)
                        call.respond(HttpStatusCode.OK, mapOf("message" to "Payment confirmed successfully"))
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.BadRequest, mapOf("error" to "Failed to confirm payment: ${e.message}")
                        )
                    }
                }

                put("/edit", {
                    description = "Edit a payment"
                    operationId = "editPayment"
                    request { body<PaymentEdit> { description = "Payment edit payload" } }
                    response {
                        code(HttpStatusCode.OK) { description = "Payment updated" }
                        code(HttpStatusCode.BadRequest) { description = "Update failed" }
                    }
                }) {
                    val request = call.receive<PaymentEdit>()
                    try {
                        paymentService.editPayment(request)
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.BadRequest, mapOf("error" to "Failed to edit payment: ${e.message}")
                        )
                    }
                }
            }
        }
    }
}

enum class PaymentSortableField {
    ID, PERSON, FLAT, DATE, AMOUNT, STATUS
}