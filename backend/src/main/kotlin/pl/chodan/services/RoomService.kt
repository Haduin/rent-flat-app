package pl.chodan.services

import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import pl.chodan.Apartment
import pl.chodan.Contract
import pl.chodan.Room
import pl.chodan.RoomDTO
import pl.chodan.RoomWithApartmentDTO
import pl.chodan.dbQuery
import java.time.LocalDate

class RoomService {
    suspend fun createRoom(name: String, apartmentId: Int?): Int = dbQuery {
        Room.insert {
            it[Room.name] = name
            it[Room.apartmentId] = apartmentId
        } get Room.id
    }

    suspend fun getRoomById(id: Int): RoomDTO? = dbQuery {
        Room.selectAll()
            .where { Room.id eq id }
            .map {
                RoomDTO(
                    it[Room.id],
                    it[Room.name],
                    it[Room.apartmentId],
                )
            }
            .singleOrNull()
    }

    suspend fun getAllRooms(): List<RoomDTO> = dbQuery {
        Room.selectAll()
            .map {
                RoomDTO(
                    it[Room.id],
                    it[Room.name],
                    it[Room.apartmentId],
                )
            }.toList()
    }

    suspend fun getRoomsWithAparts(): MutableList<RoomWithApartmentDTO> = dbQuery {
        (Room innerJoin Apartment)
            .select(
                columns = listOf(
                    Apartment.name.alias("apartment_name"),
                    Room.id.alias("room_id"),
                    Room.name.alias("room_name")
                )
            )
            .map { row ->
                RoomWithApartmentDTO(
                    id = row[Room.id],
                    number = row[Room.name],
                    apartment = row[Apartment.name]
                )
            }
                as MutableList<RoomWithApartmentDTO>

//        val sqlQuery =
//            "select  a.name as apartment_name, r.id as room_id, r.name as room_name " +
//                    "from flat.apartment a, flat.room r where a.id = r.apartment_id"
//        transaction {
//            val result = mutableListOf<RoomWithApartmentDTO>()
//            exec(sqlQuery) { rs ->
//                while (rs.next()) {
//                    result.add(
//                        RoomWithApartmentDTO(
//                            rs.getInt("room_id"),
//                            rs.getString("room_name"),
//                            rs.getString("apartment_name")
//                        )
//                    )
//                }
//            }
//            result
//        }
    }

    suspend fun fetchFreeRoomsBetweenDates(startDate: String, endDate: String): List<RoomWithApartmentDTO> = dbQuery {
        (Room innerJoin Apartment)
            .select(Room.id, Room.name, Apartment.name)
            .where {
                (Room.apartmentId eq Apartment.id).and(
                    Room.id notInSubQuery (
                            Contract
                                .select(Contract.roomId)
                                .where {
                                    (Contract.startDate greaterEq LocalDate.parse(startDate)) and
                                            (Contract.endDate lessEq LocalDate.parse(endDate))
                                }
                            ))
            }
            .map {
                RoomWithApartmentDTO(
                    id = it[Room.id],
                    number = it[Room.name],
                    apartment = it[Apartment.name]
                )
            }
    }


    suspend fun updateRoom(id: Int, name: String, apartmentId: Int?): Int = dbQuery {
        Room.update({ Room.id eq id }) { room ->
            room[Room.name] = name
            room[Room.apartmentId] = apartmentId
        }
    }

    suspend fun deleteRoom(id: Int): Int = dbQuery {
        Room.deleteWhere { Room.id eq id }
    }
}