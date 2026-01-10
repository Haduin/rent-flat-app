package pl.chodan.routing

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.PaymentConfirmationDTO
import pl.chodan.PaymentEdit
import pl.chodan.services.PaymentService

fun Application.configurePaymentRouting() {
    val paymentService by inject<PaymentService>()
    routing {
        authenticate("auth-jwt") {
            route("/payments") {
                get {
                    call.respond(paymentService.getAllPayments())
                }
                get("/{mouth}") {
                    call.parameters["mouth"]?.let { mouth ->
                        val sortFieldName = call.request.queryParameters["sortField"]
                            ?.let { PaymentSortableField.valueOf(it) }
                            ?: PaymentSortableField.ID
                        val sortOrder = call.request.queryParameters["sortOrder"]
                            ?.let { SortOrder.valueOf(it) }
                            ?: SortOrder.ASC

                        val response = paymentService.getPaymentsForMouth(mouth, sortFieldName, sortOrder)
                        call.respond(response)
                    } ?: call.respond(HttpStatusCode.BadRequest, "Mouth parameter is required")

                }
                post("/confirm") {
                    val request = call.receive<PaymentConfirmationDTO>()
                    try {
                        PaymentService().confirmPayment(request)
                        call.respond(HttpStatusCode.OK, mapOf("message" to "Payment confirmed successfully"))
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to "Failed to confirm payment: ${e.message}")
                        )
                    }
                }

                put("/edit") {
                    val request = call.receive<PaymentEdit>()
                    try {
                        paymentService.editPayment(request)
                        call.respond(HttpStatusCode.OK)
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to "Failed to edit payment: ${e.message}")
                        )
                    }
                }

                get("/summary") {
                    try {
                        val summaries = paymentService.getPaymentSummariesByPerson()
                        call.respond(summaries)
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            mapOf("error" to "Failed to get payment summaries: ${e.message}")
                        )
                    }
                }
            }
        }
    }
}

enum class PaymentSortableField() {
    ID(),
    PERSON(),
    FLAT(),
    DATE(),
    AMOUNT(),
    STATUS()
}