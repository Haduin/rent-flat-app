package pl.chodan.model.contract.routing

import io.github.smiley4.ktoropenapi.delete
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
import pl.chodan.model.contract.dto.ContractDTO
import pl.chodan.model.contract.dto.ContractHistoryDTO
import pl.chodan.model.contract.dto.DeleteContractDTO
import pl.chodan.model.contract.dto.NewContractDTO
import pl.chodan.model.contract.dto.UpdateContractDetails
import pl.chodan.model.contract.service.ContractDeleteResult
import pl.chodan.model.contract.service.ContractService
import pl.chodan.model.payments.service.PaymentService
import pl.chodan.ultis.DateValidator
import pl.chodan.ultis.ValidationResult

fun Application.configureContractRouting() {
    val contractService by inject<ContractService>()
    val paymentService by inject<PaymentService>()
    routing {
        authenticate("auth-jwt") {
            route("/contracts", {
                tags = listOf("Contracts")
            }) {
                get({
                    description = "Get all contracts with room and person details"
                    operationId = "getAllContracts"
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Returns all contracts"
                            body<List<ContractDTO>>()
                        }
                    }
                }) {
                    call.respond(contractService.getAllContractsWithRoomAndPersonDetails())
                }
                get("/{id}/history", {
                    description = "Get the change history (snapshots) of a contract, oldest first"
                    operationId = "getContractHistory"
                    request {
                        pathParameter<Int>("id") { description = "Contract id" }
                    }
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Returns the contract's change history"
                            body<List<ContractHistoryDTO>>()
                        }
                        code(HttpStatusCode.BadRequest) { description = "Invalid contract id" }
                    }
                }) {
                    val contractId = call.parameters["id"]?.toIntOrNull()
                    if (contractId == null) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Nieprawidłowe id kontraktu"))
                        return@get
                    }
                    call.respond(contractService.getContractHistory(contractId))
                }
                post("/generateMonthlyPayments/{month}", {
                    description = "Generate monthly payments for active contracts"
                    operationId = "generateMonthlyPayments"
                    request {
                        pathParameter<String>("month") { description = "Month in format YYYY-MM" }
                    }
                    response {
                        code(HttpStatusCode.Created) { description = "Payments generated" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid month format" }
                        code(HttpStatusCode.InternalServerError) { description = "Generation failed" }
                    }
                }) {
                    val monthParam = call.parameters["month"]

                    when (val validationResult = DateValidator.instance.validateMonthParameter(monthParam)) {
                        is ValidationResult.Error -> {
                            call.respond(
                                HttpStatusCode.BadRequest, mapOf("error" to validationResult.message)
                            )
                            return@post
                        }

                        is ValidationResult.Success -> {
                            try {
                                call.respond(
                                    HttpStatusCode.Created,
                                    paymentService.generateNewPaymentsForActiveContracts(validationResult.value)
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
                post({
                    description = "Create a new contract"
                    operationId = "createContract"
                    request { body<NewContractDTO> { description = "New contract details" } }
                    response {
                        code(HttpStatusCode.Created) { description = "Contract created" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid contract details" }
                    }
                }) {
                    val newContract = call.receive<NewContractDTO>()
                    try {
                        contractService.createContract(newContract)

                        call.respond(HttpStatusCode.Created)
                    } catch (ex: Exception) {
                        println(ex.message)
                    }
                }
                put({
                    description = "Update contract details"
                    operationId = "updateContract"
                    request { body<UpdateContractDetails> { description = "Contract update details" } }
                    response {
                        code(HttpStatusCode.OK) { description = "Contract updated" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid update details" }
                    }
                }) {
                    val contract = call.receive<UpdateContractDetails>()
                    try {
                        contractService.updateContract(contract)
                        call.respond(HttpStatusCode.OK, "Kontrakt został pomyślnie zaktualizowany")
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to "Failed to edit contract: ${e.message}")
                        )
                    }

                }
                delete({
                    description = "Delete (finish) a contract"
                    operationId = "deleteContract"
                    request { body<DeleteContractDTO> { description = "Contract delete details" } }
                    response {
                        code(HttpStatusCode.OK) { description = "Contract finished" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid delete details" }
                        code(HttpStatusCode.InternalServerError) { description = "Deletion failed" }
                        code(HttpStatusCode.NotFound) { description = "Contract not found" }
                    }
                }) {
                    try {
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
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            mapOf("error" to "Failed to delete contract: ${e.message}")
                        )
                    }
                }

            }
        }
    }
}
