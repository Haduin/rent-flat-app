package pl.chodan.model.apartment.routing

import io.github.smiley4.ktoropenapi.get
import io.github.smiley4.ktoropenapi.route
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.model.apartment.dto.ApartmentWithRooms
import pl.chodan.model.apartment.service.ApartmentService

fun Application.configureApartmentRouting() {

    val apartmentService by inject<ApartmentService>()

    routing {
        route("/apartments", {
            tags = listOf("Apartments")
        }) {
            get({
                description = "Get all apartments with their rooms"
                operationId = "getAllApartments"
                response {
                    code(HttpStatusCode.OK) {
                        description = "Returns a list of apartments with their rooms"
                        body<List<ApartmentWithRooms>>()
                    }
                }
            }) {
                call.respond(apartmentService.getAllApartmentsWithRoomDetails())

//                withUser { user ->
//
//                    application.log.info("User ${user.username} with roles ${user.roles} is accessing apartments")
//                }

            }
            get("hello", {
                description = "A simple hello world endpoint"
                operationId = "helloEndpoint"
                request {
                    queryParameter<String>("name") {
                        description = "The name to greet"
                        required = false
                    }
                }
                response {
                    code(HttpStatusCode.OK) {
                        description = "Returns a greeting message"
                        body<String>()
                    }
                }
            }) {
                val name = call.request.queryParameters["name"] ?: "World"
                call.respondText("Hello $name!")
            }
        }
    }
}

