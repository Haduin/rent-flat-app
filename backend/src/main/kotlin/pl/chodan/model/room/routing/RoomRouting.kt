package pl.chodan.model.room.routing

import io.github.smiley4.ktoropenapi.get
import io.github.smiley4.ktoropenapi.route
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.error.ErrorCode
import pl.chodan.error.errors
import pl.chodan.error.isoDateQuery
import pl.chodan.model.room.dto.RoomWithApartmentDTO
import pl.chodan.model.room.service.RoomService

fun Application.configureRoomRouting() {
    val roomService by inject<RoomService>()
    routing {
        authenticate("auth-jwt") {
            route("/rooms", {
                tags = listOf("Rooms")
            }) {
                get({
                    description = "Get all rooms with apartments"
                    operationId = "getAllRooms"
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Returns rooms with apartment details"
                            body<List<RoomWithApartmentDTO>>()
                        }
                    }
                }) {
                    call.respond(roomService.getRoomsWithAparts())
                }
                get("/non-occupied", {
                    description = "Get non-occupied rooms between dates"
                    operationId = "getNonOccupiedRooms"
                    errors(ErrorCode.VALIDATION_FAILED)
                    request {
                        queryParameter<String>("startDate") { description = "Start date (YYYY-MM-DD)"; required = true }
                        queryParameter<String>("endDate") { description = "End date (YYYY-MM-DD)"; required = true }
                    }
                    response {
                        code(HttpStatusCode.OK) {
                            description = "Returns available rooms between dates"
                            body<List<RoomWithApartmentDTO>>()
                        }
                    }
                }) {
                    call.respond(
                        roomService.fetchFreeRoomsBetweenDates(call.isoDateQuery("startDate"), call.isoDateQuery("endDate"))
                    )
                }
            }
        }
    }
}