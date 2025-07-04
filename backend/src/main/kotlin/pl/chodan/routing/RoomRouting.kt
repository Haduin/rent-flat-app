package pl.chodan.routing

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import pl.chodan.services.RoomService

fun Application.configureRoomRouting() {
    val roomService = RoomService()
    routing {
        authenticate("auth-jwt") {
            route("/rooms") {
                get {
                    call.respond(roomService.getAllRooms())
                }
                get("/non-occupied") {
                    try {
                        val startDate = call.request.queryParameters["startDate"].orEmpty()
                        val endDate = call.request.queryParameters["endDate"].orEmpty()
                        call.respond(roomService.fetchFreeRoomsBetweenDates(startDate, endDate))
                    } catch (_: Exception) {
                        call.respond(HttpStatusCode.BadRequest)
                    }

                }
            }
        }
    }
}