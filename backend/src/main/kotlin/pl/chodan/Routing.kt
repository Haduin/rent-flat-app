package pl.chodan


import io.ktor.http.*
import io.ktor.serialization.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureApartmentRouting() {

    val apartmentService = ApartmentService()

    routing {
        route("/apartments") {
            get {
                call.respond(apartmentService.getAllApartments())
            }
        }
    }
}

fun Application.configurePersonRouting() {

    val personService = PersonService()
    routing {
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
                val id = call.parameters["id"]?.toIntOrNull()
                if (id != null) {
                    val personToUpdate = call.receive<UpdatePersonDTO>()
                    try {
                        personService.updatePerson(personToUpdate)
                        call.respond(HttpStatusCode.NoContent)
                    } catch (ex: IllegalStateException) {
                        call.respond(HttpStatusCode.BadRequest)
                    }
                } else {
                    call.respond(HttpStatusCode.NotFound)
                }
            }
        }
    }

}

fun Application.configureContractRouting() {
    val contractService = ContractService()
    routing {
        route("/contracts") {
            get {
                call.respond(contractService.getAllContracts())
            }
        }
    }
}

fun Application.configurePaymentRouting() {
    val paymentService = PaymentService()
    routing {
        route("/payments") {
            get {
                call.respond(paymentService.getAllPayments())
            }
        }
    }
}