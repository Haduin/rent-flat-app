package pl.chodan.model.persons.routing

import io.github.smiley4.ktoropenapi.*
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
import pl.chodan.model.persons.dto.CreatedPersonDTO
import pl.chodan.model.persons.dto.PersonDTO
import pl.chodan.model.persons.dto.UpdatePersonDTO
import pl.chodan.model.persons.service.PersonService
import pl.chodan.routing.IdResponse

fun Application.configurePersonRouting() {

    val personService by inject<PersonService>()
    routing {
        authenticate("auth-jwt") {
            route("/persons", {
                tags = listOf("Persons")
            }) {
                get({
                    description = "Get all persons"
                    operationId = "getAllPersons"
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Returns all persons"
                            body<List<PersonDTO>>()
                        }
                    }
                }) {
                    call.respond(personService.getAllPersons())
                }
                get("/non-residents", {
                    description = "Get all non-resident persons"
                    operationId = "getNonResidentPersons"
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Returns non-resident persons"
                            body<List<PersonDTO>>()
                        }
                    }
                }) {
                    call.respond(personService.getNonResidentPersons())
                }
                post({
                    description = "Create a new person"
                    operationId = "createPerson"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD)
                    request { body<CreatedPersonDTO> { description = "New person payload" } }
                    response {
                        code(HttpStatusCode.Created) {
                            description = "Person created"
                            body<IdResponse>()
                        }
                    }
                }) {
                    call.respond(HttpStatusCode.Created, IdResponse(personService.createPerson(call.receive<CreatedPersonDTO>())))
                }
                delete("/{id}", {
                    description = "Delete person by id"
                    operationId = "deletePerson"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.PERSON_NOT_FOUND, ErrorCode.PERSON_IN_USE)
                    request {
                        pathParameter<Int>("id") { description = "Person id" }
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Deleted" }
                    }
                }) {
                    personService.deletePerson(call.intParam("id"))
                    call.respond(HttpStatusCode.NoContent)
                }
                put("/{id}", {
                    description = "Update a person"
                    operationId = "updatePerson"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD, ErrorCode.PERSON_NOT_FOUND)
                    request {
                        pathParameter<Int>("id") { description = "Person id" }
                        body<UpdatePersonDTO> { description = "Person update payload" }
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Updated" }
                    }
                }) {
                    personService.updatePerson(call.intParam("id"), call.receive<UpdatePersonDTO>())
                    call.respond(HttpStatusCode.NoContent)
                }
            }
        }
    }

}