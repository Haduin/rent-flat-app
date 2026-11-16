package pl.chodan.model.apartment.routing

import io.github.smiley4.ktoropenapi.delete
import io.github.smiley4.ktoropenapi.get
import io.github.smiley4.ktoropenapi.post
import io.github.smiley4.ktoropenapi.put
import io.github.smiley4.ktoropenapi.route
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
import pl.chodan.model.apartment.dto.ApartmentResponse
import pl.chodan.model.apartment.dto.ApartmentWithRooms
import pl.chodan.model.apartment.dto.SaveNameRequest
import pl.chodan.model.room.dto.RoomResponse
import pl.chodan.model.apartment.service.ApartmentService

private suspend fun ApplicationCall.receiveName(): String = receive<SaveNameRequest>().name.trim()

fun Application.configureApartmentRouting() {

    val apartmentService by inject<ApartmentService>()

    routing {
        authenticate("auth-jwt") {
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
                }
                post({
                    description = "Create an apartment"
                    operationId = "createApartment"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD)
                    request { body<SaveNameRequest>() }
                    response {
                        code(HttpStatusCode.Created) {
                            description = "Apartment created"
                            body<ApartmentResponse>()
                        }
                    }
                }) {
                    call.respond(HttpStatusCode.Created, apartmentService.createApartment(call.receiveName()))
                }
                put("/{id}", {
                    description = "Rename an apartment"
                    operationId = "renameApartment"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD, ErrorCode.APARTMENT_NOT_FOUND)
                    request {
                        pathParameter<Int>("id") { description = "Apartment id" }
                        body<SaveNameRequest>()
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Renamed" }
                    }
                }) {
                    apartmentService.renameApartment(call.intParam("id"), call.receiveName())
                    call.respond(HttpStatusCode.NoContent)
                }
                post("/{id}/rooms", {
                    description = "Add a room to an apartment"
                    operationId = "createRoom"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD, ErrorCode.APARTMENT_NOT_FOUND)
                    request {
                        pathParameter<Int>("id") { description = "Apartment id" }
                        body<SaveNameRequest>()
                    }
                    response {
                        code(HttpStatusCode.Created) {
                            description = "Room created"
                            body<RoomResponse>()
                        }
                    }
                }) {
                    call.respond(
                        HttpStatusCode.Created,
                        apartmentService.createRoom(call.intParam("id"), call.receiveName())
                    )
                }
                put("/{id}/rooms/{roomId}", {
                    description = "Rename a room"
                    operationId = "renameRoom"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD, ErrorCode.ROOM_NOT_FOUND)
                    request {
                        pathParameter<Int>("id") { description = "Apartment id" }
                        pathParameter<Int>("roomId") { description = "Room id" }
                        body<SaveNameRequest>()
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Renamed" }
                    }
                }) {
                    apartmentService.renameRoom(call.intParam("id"), call.intParam("roomId"), call.receiveName())
                    call.respond(HttpStatusCode.NoContent)
                }
                delete("/{id}/rooms/{roomId}", {
                    description = "Delete a room that has no contracts, costs or cost templates"
                    operationId = "deleteRoom"
                    errors(ErrorCode.VALIDATION_FAILED, ErrorCode.ROOM_NOT_FOUND, ErrorCode.ROOM_IN_USE)
                    request {
                        pathParameter<Int>("id") { description = "Apartment id" }
                        pathParameter<Int>("roomId") { description = "Room id" }
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Deleted" }
                    }
                }) {
                    apartmentService.deleteRoom(call.intParam("id"), call.intParam("roomId"))
                    call.respond(HttpStatusCode.NoContent)
                }
            }
        }
    }
}
