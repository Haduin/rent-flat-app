package pl.chodan.routing

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.PaymentConfirmationDTO
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
                        val response = paymentService.getPaymentsForMouth(mouth)
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
            }
        }
    }
}

