package pl.chodan.services

import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.RoomDTO
import pl.chodan.RoomWithApartmentDTO
import pl.chodan.database.*
import java.time.LocalDate

class RoomService : KoinComponent {

    private val databaseProvider by inject<DatabaseProviderContract>()

    suspend fun createRoom(name: String, apartmentId: Int?): Int = databaseProvider.dbQuery {
        Room.insert {
            it[Room.name] = name
            it[Room.apartmentId] = apartmentId
        } get Room.id
    }

    suspend fun getRoomById(id: Int): RoomDTO? = databaseProvider.dbQuery {
        Room.selectAll().where { Room.id eq id }.map {
            RoomDTO(
                it[Room.id],
                it[Room.name],
                it[Room.apartmentId],
            )
        }.singleOrNull()
    }

    suspend fun getAllRooms(): List<RoomDTO> = databaseProvider.dbQuery {
        Room.selectAll().map {
            RoomDTO(
                it[Room.id],
                it[Room.name],
                it[Room.apartmentId],
            )
        }.toList()
    }

    suspend fun getRoomsWithAparts(): MutableList<RoomWithApartmentDTO> = databaseProvider.dbQuery {
        (Room innerJoin Apartment).select(
            columns = listOf(
                Apartment.name.alias("apartment_name"), Room.id.alias("room_id"), Room.name.alias("room_name")
            )
        ).map { row ->
            RoomWithApartmentDTO(
                id = row[Room.id], number = row[Room.name], apartment = row[Apartment.name]
            )
        } as MutableList<RoomWithApartmentDTO>

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

    suspend fun fetchFreeRoomsBetweenDates(startDate: String, endDate: String): List<RoomWithApartmentDTO> =
        databaseProvider.dbQuery {
            (Room innerJoin Apartment).select(Room.id, Room.name, Apartment.name)
                .where {
                    (Room.apartmentId eq Apartment.id)
                        .and(Room.id notInSubQuery (Contract.select(Contract.roomId).where {
                            (Contract.status eq ContractStatus.ACTIVE) and (
                                    (Contract.startDate lessEq LocalDate.parse(endDate)) and
                                            (Contract.endDate greaterEq LocalDate.parse(startDate))
                                    )
                        }))
                }.map {
                    RoomWithApartmentDTO(
                        id = it[Room.id],
                        number = it[Room.name],
                        apartment = it[Apartment.name]
                    )
                }
        }

}