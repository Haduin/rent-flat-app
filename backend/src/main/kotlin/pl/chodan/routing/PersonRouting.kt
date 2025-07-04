package pl.chodan.routing

import io.ktor.http.*
import io.ktor.serialization.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import pl.chodan.CreatedPersonDTO
import pl.chodan.UpdatePersonDTO
import pl.chodan.services.PersonService

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