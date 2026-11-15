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
import pl.chodan.error.ErrorCode
import pl.chodan.error.errors
import pl.chodan.error.intParam
import pl.chodan.error.optionalEnumQuery
import pl.chodan.error.yearMonthQuery
import pl.chodan.model.payments.dto.PaymentDTO
import pl.chodan.model.payments.dto.PaymentEdit
import pl.chodan.model.payments.dto.PaymentHistoryWithPersonDTO
import pl.chodan.model.payments.dto.PaymentSplitDTO
import pl.chodan.model.payments.dto.PaymentSplitEntryDTO
import pl.chodan.model.payments.service.PaymentService
import pl.chodan.model.persons.dto.PaymentConfirmationDTO
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
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Returns all payments"
                            body<List<PaymentDTO>>()
                        }
                    }
                }) {
                    call.respond(paymentService.getAllPayments())
                }
                get("/{month}", {
                    description = "Get payments for given month with sorting"
                    operationId = "getPaymentsForMonth"
                    errors(ErrorCode.VALIDATION_FAILED)
                    request {
                        pathParameter<String>("month") { description = "Month in format YYYY-MM" }
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
                    }
                }) {
                    call.respond(
                        paymentService.getPaymentsForMonth(
                            call.yearMonthQuery("month").value,
                            call.optionalEnumQuery<PaymentSortableField>("sortField") ?: PaymentSortableField.ID,
                            call.optionalEnumQuery<SortOrder>("sortOrder") ?: SortOrder.ASC
                        )
                    )
                }
                post("/confirm", {
                    description = "Confirm a payment"
                    operationId = "confirmPayment"
                    errors(
                        ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD,
                        ErrorCode.PAYMENT_NOT_FOUND, ErrorCode.PAYMENT_NOT_CONFIRMABLE
                    )
                    request { body<PaymentConfirmationDTO> { description = "Payment confirmation payload" } }
                    response { code(HttpStatusCode.NoContent) { description = "Payment confirmed" } }
                }) {
                    paymentService.confirmPayment(call.receive<PaymentConfirmationDTO>())
                    call.respond(HttpStatusCode.NoContent)
                }

                put("/edit", {
                    description = "Edit a payment"
                    operationId = "editPayment"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD, ErrorCode.PAYMENT_NOT_FOUND)
                    request { body<PaymentEdit> { description = "Payment edit payload" } }
                    response { code(HttpStatusCode.NoContent) { description = "Payment updated" } }
                }) {
                    paymentService.editPayment(call.receive<PaymentEdit>())
                    call.respond(HttpStatusCode.NoContent)
                }

                post("/split", {
                    description = "Record a partial (split) payment towards a payment's due amount"
                    operationId = "splitPayment"
                    errors(
                        ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD, ErrorCode.PAYMENT_NOT_FOUND,
                        ErrorCode.PAYMENT_NOT_SPLITTABLE, ErrorCode.PAYMENT_OVERPAID
                    )
                    request { body<PaymentSplitDTO> { description = "Split payment payload" } }
                    response { code(HttpStatusCode.NoContent) { description = "Split payment recorded" } }
                }) {
                    paymentService.splitPayment(call.receive<PaymentSplitDTO>())
                    call.respond(HttpStatusCode.NoContent)
                }

                get("/{id}/splits", {
                    description = "Get the recorded split payments (instalments) for a payment"
                    operationId = "getPaymentSplits"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.PAYMENT_NOT_FOUND)
                    request {
                        pathParameter<Int>("id") { description = "Payment id" }
                    }
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Split payments for the given payment"
                            body<List<PaymentSplitEntryDTO>>()
                        }
                    }
                }) {
                    call.respond(paymentService.getPaymentSplits(call.intParam("id")))
                }
            }
        }
    }
}

enum class PaymentSortableField {
    ID, PERSON, FLAT, DATE, AMOUNT, STATUS
}