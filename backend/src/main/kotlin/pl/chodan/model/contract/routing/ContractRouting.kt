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
import pl.chodan.error.ErrorCode
import pl.chodan.error.errors
import pl.chodan.error.intParam
import pl.chodan.error.yearMonthQuery
import pl.chodan.model.contract.dto.ContractDTO
import pl.chodan.model.contract.dto.ContractHistoryDTO
import pl.chodan.model.contract.dto.DeleteContractDTO
import pl.chodan.model.contract.dto.NewContractDTO
import pl.chodan.model.contract.dto.UpdateContractDetails
import pl.chodan.model.contract.service.ContractService
import pl.chodan.model.payments.service.PaymentService
import pl.chodan.routing.IdResponse

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
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.CONTRACT_NOT_FOUND)
                    request {
                        pathParameter<Int>("id") { description = "Contract id" }
                    }
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Returns the contract's change history"
                            body<List<ContractHistoryDTO>>()
                        }
                    }
                }) {
                    call.respond(contractService.getContractHistory(call.intParam("id")))
                }
                post("/generateMonthlyPayments/{month}", {
                    description = "Generate monthly payments for active contracts"
                    operationId = "generateMonthlyPayments"
                    errors(ErrorCode.VALIDATION_FAILED)
                    request {
                        pathParameter<String>("month") { description = "Month in format YYYY-MM" }
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Payments generated" }
                    }
                }) {
                    paymentService.generateNewPaymentsForActiveContracts(call.yearMonthQuery("month").value)
                    call.respond(HttpStatusCode.NoContent)
                }
                post({
                    description = "Create a new contract"
                    operationId = "createContract"
                    errors(
                        ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD,
                        ErrorCode.PERSON_NOT_FOUND, ErrorCode.ROOM_NOT_FOUND
                    )
                    request { body<NewContractDTO> { description = "New contract details" } }
                    response {
                        code(HttpStatusCode.Created) {
                            description = "Contract created"
                            body<IdResponse>()
                        }
                    }
                }) {
                    call.respond(HttpStatusCode.Created, IdResponse(contractService.createContract(call.receive<NewContractDTO>())))
                }
                put({
                    description = "Update contract details"
                    operationId = "updateContract"
                    errors(
                        ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD,
                        ErrorCode.CONTRACT_NOT_FOUND, ErrorCode.ROOM_NOT_FOUND, ErrorCode.CONTRACT_TERMINATED
                    )
                    request { body<UpdateContractDetails> { description = "Contract update details" } }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Contract updated" }
                    }
                }) {
                    contractService.updateContract(call.receive<UpdateContractDetails>())
                    call.respond(HttpStatusCode.NoContent)
                }
                delete({
                    description = "Delete (finish) a contract"
                    operationId = "deleteContract"
                    errors(
                        ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD,
                        ErrorCode.CONTRACT_NOT_FOUND, ErrorCode.CONTRACT_TERMINATED
                    )
                    request { body<DeleteContractDTO> { description = "Contract delete details" } }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Contract finished" }
                    }
                }) {
                    contractService.deleteContract(call.receive<DeleteContractDTO>())
                    call.respond(HttpStatusCode.NoContent)
                }
            }
        }
    }
}
