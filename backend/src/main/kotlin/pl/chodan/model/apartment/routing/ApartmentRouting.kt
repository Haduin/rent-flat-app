package pl.chodan.model.apartment.routing

import io.github.smiley4.ktoropenapi.delete
import io.github.smiley4.ktoropenapi.get
import io.github.smiley4.ktoropenapi.post
import io.github.smiley4.ktoropenapi.put
import io.github.smiley4.ktoropenapi.route
import io.ktor.http.*
import io.ktor.serialization.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import pl.chodan.model.apartment.dto.ApartmentResponse
import pl.chodan.model.apartment.dto.ApartmentWithRooms
import pl.chodan.model.apartment.dto.SaveNameRequest
import pl.chodan.model.room.dto.RoomResponse
import pl.chodan.model.apartment.service.ApartmentService
import pl.chodan.model.apartment.service.RoomDeletion

/** Reads and validates the name body; answers 400 and returns null when it's missing, malformed or invalid. */
private suspend fun ApplicationCall.receiveValidName(): String? = try {
    receive<SaveNameRequest>().validatedName()
} catch (ex: IllegalArgumentException) {
    respond(HttpStatusCode.BadRequest, mapOf("error" to (ex.message ?: "Invalid name")))
    null
} catch (ex: JsonConvertException) {
    respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid payload"))
    null
}

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
                    request { body<SaveNameRequest>() }
                    response {
                        code(HttpStatusCode.Created) {
                            description = "Apartment created"
                            body<ApartmentResponse>()
                        }
                        code(HttpStatusCode.BadRequest) { description = "Missing or invalid name" }
                    }
                }) {
                    val name = call.receiveValidName() ?: return@post
                    call.respond(HttpStatusCode.Created, apartmentService.createApartment(name))
                }
                put("/{id}", {
                    description = "Rename an apartment"
                    operationId = "renameApartment"
                    request {
                        pathParameter<Int>("id") { description = "Apartment id" }
                        body<SaveNameRequest>()
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Renamed" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid id or name" }
                        code(HttpStatusCode.NotFound) { description = "Apartment not found" }
                    }
                }) {
                    val id = call.parameters["id"]?.toIntOrNull()
                        ?: return@put call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid id"))
                    val name = call.receiveValidName() ?: return@put
                    call.respond(if (apartmentService.renameApartment(id, name)) HttpStatusCode.NoContent else HttpStatusCode.NotFound)
                }
                post("/{id}/rooms", {
                    description = "Add a room to an apartment"
                    operationId = "createRoom"
                    request {
                        pathParameter<Int>("id") { description = "Apartment id" }
                        body<SaveNameRequest>()
                    }
                    response {
                        code(HttpStatusCode.Created) {
                            description = "Room created"
                            body<RoomResponse>()
                        }
                        code(HttpStatusCode.BadRequest) { description = "Invalid id or name" }
                        code(HttpStatusCode.NotFound) { description = "Apartment not found" }
                    }
                }) {
                    val id = call.parameters["id"]?.toIntOrNull()
                        ?: return@post call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid id"))
                    val name = call.receiveValidName() ?: return@post
                    apartmentService.createRoom(id, name)
                        ?.let { call.respond(HttpStatusCode.Created, it) }
                        ?: call.respond(HttpStatusCode.NotFound)
                }
                put("/{id}/rooms/{roomId}", {
                    description = "Rename a room"
                    operationId = "renameRoom"
                    request {
                        pathParameter<Int>("id") { description = "Apartment id" }
                        pathParameter<Int>("roomId") { description = "Room id" }
                        body<SaveNameRequest>()
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Renamed" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid id or name" }
                        code(HttpStatusCode.NotFound) { description = "Room not found in that apartment" }
                    }
                }) {
                    val id = call.parameters["id"]?.toIntOrNull()
                    val roomId = call.parameters["roomId"]?.toIntOrNull()
                    if (id == null || roomId == null) {
                        return@put call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid id"))
                    }
                    val name = call.receiveValidName() ?: return@put
                    call.respond(if (apartmentService.renameRoom(id, roomId, name)) HttpStatusCode.NoContent else HttpStatusCode.NotFound)
                }
                delete("/{id}/rooms/{roomId}", {
                    description = "Delete a room that has no contracts, costs or cost templates"
                    operationId = "deleteRoom"
                    request {
                        pathParameter<Int>("id") { description = "Apartment id" }
                        pathParameter<Int>("roomId") { description = "Room id" }
                    }
                    response {
                        code(HttpStatusCode.NoContent) { description = "Deleted" }
                        code(HttpStatusCode.BadRequest) { description = "Invalid id" }
                        code(HttpStatusCode.NotFound) { description = "Room not found in that apartment" }
                        code(HttpStatusCode.Conflict) { description = "Room has contracts, costs or cost templates" }
                    }
                }) {
                    val id = call.parameters["id"]?.toIntOrNull()
                    val roomId = call.parameters["roomId"]?.toIntOrNull()
                    if (id == null || roomId == null) {
                        return@delete call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid id"))
                    }
                    when (apartmentService.deleteRoom(id, roomId)) {
                        RoomDeletion.DELETED -> call.respond(HttpStatusCode.NoContent)
                        RoomDeletion.NOT_FOUND -> call.respond(HttpStatusCode.NotFound)
                        RoomDeletion.IN_USE -> call.respond(
                            HttpStatusCode.Conflict,
                            mapOf("error" to "Pokój ma powiązane umowy lub koszty")
                        )
                    }
                }
            }
        }
    }
}
