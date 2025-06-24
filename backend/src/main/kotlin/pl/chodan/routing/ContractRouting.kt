package pl.chodan.routing

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import pl.chodan.DeleteContractDTO
import pl.chodan.NewContractDTO
import pl.chodan.services.ContractDeleteResult
import pl.chodan.services.ContractService
import pl.chodan.ultis.DateValidator
import pl.chodan.ultis.ValidationResult

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
                delete {
                    val details = call.receive<DeleteContractDTO>()

                    when (val result = contractService.deleteContract(details)) {
                        is ContractDeleteResult.Success -> {
                            call.respond(HttpStatusCode.OK, "Kontrakt został pomyślnie zakończony")
                        }

                        is ContractDeleteResult.PaymentUpdateError -> {
                            call.respond(HttpStatusCode.InternalServerError, result.message)
                        }

                        is ContractDeleteResult.ContractUpdateError -> {
                            call.respond(HttpStatusCode.InternalServerError, result.message)
                        }

                        ContractDeleteResult.NotFound -> {
                            call.respond(HttpStatusCode.NotFound, "Nie znaleziono kontraktu")
                        }
                    }
                }

            }
        }
    }
}
