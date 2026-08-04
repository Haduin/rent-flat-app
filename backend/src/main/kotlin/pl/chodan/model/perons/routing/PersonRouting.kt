package pl.chodan.model.perons.routing

import io.github.smiley4.ktoropenapi.*
import io.ktor.http.*
import io.ktor.serialization.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.model.perons.dto.CreatedPersonDTO
import pl.chodan.model.perons.dto.PersonDTO
import pl.chodan.model.perons.dto.UpdatePersonDTO
import pl.chodan.model.perons.service.PersonService

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
                    request { body<CreatedPersonDTO> { description = "New person payload" } }
                    response {
                        code(HttpStatusCode.Created) { description = "Person created" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid payload" }
                    }
                }) {
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
                delete("/{id}", {
                    description = "Delete person by id"
                    operationId = "deletePerson"
                    request {
                        pathParameter<Int>("id") { description = "Person id" }
                    }
                    response { code(HttpStatusCode.OK) { description = "Deleted" } }
                }) {
                    call.parameters["id"]?.toIntOrNull()?.let { id ->
                        personService.deletePerson(id)
                        call.respond(HttpStatusCode.OK)
                    }
                }
                put("/{id}", {
                    description = "Update a person"
                    operationId = "updatePerson"
                    request {
                        pathParameter<Int>("id") { description = "Person id" }
                        body<UpdatePersonDTO> { description = "Person update payload" }
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Updated" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid update" }
                        code(HttpStatusCode.NotFound) { description = "Person not found" }
                    }
                }) {
                    call.parameters["id"]?.toIntOrNull()?.let {
                        val personToUpdate = call.receive<UpdatePersonDTO>()
                        try {
                            personService.updatePerson(personToUpdate)
                            call.respond(HttpStatusCode.NoContent)
                        } catch (ex: IllegalStateException) {
                            call.respond(HttpStatusCode.BadRequest)
                        }
                    } ?: call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid id"))

                }
            }
        }
    }

}