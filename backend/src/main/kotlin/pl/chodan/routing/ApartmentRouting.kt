package pl.chodan.routing

import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import pl.chodan.services.ApartmentService

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