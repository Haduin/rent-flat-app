package pl.chodan.routing

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.services.ApartmentService

fun Application.configureApartmentRouting() {

    val apartmentService by inject<ApartmentService>()

    routing {
        route("/apartments") {
            withUser { user ->
                get {
                    application.log.info("User ${user.username} with roles ${user.roles} is accessing apartments")
                    call.respond(apartmentService.getAllApartmentsWithRoomDetails())
                }
            }
        }
    }
}
