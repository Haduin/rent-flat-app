package pl.chodan


import io.ktor.http.*
import io.ktor.serialization.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import pl.chodan.ultis.DateValidator
import pl.chodan.ultis.ValidationResult

//fun Application.configureUtilityRouting() {
//    val utilityService = UtilityCostsService()
//
//    routing {
//        authenticate("auth-jwt") {
//            route("/utility-costs") {
//                get("/{apartmentId}") {
//                    call.parameters["apartmentId"]?.toIntOrNull()?.let { id ->
//                        call.respond(utilityService.getAllCostsForApartment(id))
//                    } ?: call.respond(HttpStatusCode.BadRequest)
//                }
//                post {
//                    val request = call.receive<AddNewUtilityCostDTO>()
//                    utilityService.addCost(request)
//                    call.respond(HttpStatusCode.Created)
//                }
//            }
//        }
//    }
//
//}

fun Application.configureApartmentRouting() {

    val apartmentService = ApartmentService()

    routing {
        authenticate("auth-jwt") {
            route("/apartments") {
                get {
                    call.respond(apartmentService.getAllApartmentsWithRoomDetails())
                }
            }
        }
    }
}

fun Application.configureRoomRouting() {
    val roomService = RoomService()
    routing {
        authenticate("auth-jwt") {
            route("/rooms") {
                get {
                    call.respond(roomService.getAllRooms())
                }
                get("/non-occupied") {
                    try {
                        val startDate = call.request.queryParameters["startDate"].orEmpty()
                        val endDate = call.request.queryParameters["endDate"].orEmpty()
                        call.respond(roomService.fetchFreeRoomsBetweenDates(startDate, endDate))
                    } catch (ex: Exception) {
                        call.respond(HttpStatusCode.BadRequest)
                    }

                }
            }
        }
    }
}

fun Application.configurePersonRouting() {

    val personService = PersonService()
    routing {
        authenticate("auth-jwt") {
            route("/persons") {
                get {
                    call.respond(personService.getAllPersons())
                }
                get("/non-residents") {
                    call.respond(personService.getNonResidentPersons())
                }
                post {
                    try {
                        val createPerson = call.receive<CreatedPersonDTO>()
                        personService.createPerson(createPerson)
                        call.respond(HttpStatusCode.Created)
                    } catch (ex: IllegalStateException) {
                        call.respond(HttpStatusCode.BadRequest)
                    } catch (ex: JsonConvertException) {
                        call.respond(HttpStatusCode.BadRequest)
                    }
                }
                delete("/{id}") {
                    call.parameters["id"]?.toIntOrNull()?.let { id -> personService.deletePerson(id) }
                    call.respond(HttpStatusCode.OK)
                }
                put("/{id}") {
                    call.parameters["id"]?.toIntOrNull()?.let {
                        val personToUpdate = call.receive<UpdatePersonDTO>()
                        try {
                            personService.updatePerson(personToUpdate)
                            call.respond(HttpStatusCode.NoContent)
                        } catch (ex: IllegalStateException) {
                            call.respond(HttpStatusCode.BadRequest)
                        }
                    } ?: call.respond(HttpStatusCode.NotFound)

                }
            }
        }
    }

}

fun Application.configureContractRouting() {
    val contractService = ContractService()
    routing {
        authenticate("auth-jwt") {
            route("/contracts") {
                get {
                    call.respond(contractService.getAllContractsWithRoomAndPersonDetails())
                }
                post("/generateMonthlyPayments/{month}") {
                    val monthParam = call.parameters["month"]

                    when (val validationResult = DateValidator.instance.validateMonthParameter(monthParam)) {
                        is ValidationResult.Error -> {
                            call.respond(
                                HttpStatusCode.BadRequest,
                                mapOf("error" to validationResult.message)
                            )
                            return@post
                        }

                        is ValidationResult.Success -> {
                            try {
                                call.respond(
                                    HttpStatusCode.Created,
                                    contractService.generateNewPaymentsForActiveContracts(validationResult.value)
                                )
                            } catch (e: Exception) {
                                call.respond(
                                    HttpStatusCode.InternalServerError,
                                    mapOf("error" to "Failed to generate payments: ${e.message}")
                                )
                            }
                        }
                    }

                }
                post {
                    val newContract = call.receive<NewContractDTO>()
                    try {
                        contractService.createContract(newContract)
                        call.respond(HttpStatusCode.Created)
                    } catch (ex: Exception) {
                        println(ex.message)
                    }
                }
            }
        }
    }
}

fun Application.configurePaymentRouting() {
    val paymentService = PaymentService()
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
                        println(e.message)
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

