package pl.chodan


import io.ktor.server.application.*
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