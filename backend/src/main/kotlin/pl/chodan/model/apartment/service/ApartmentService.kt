package pl.chodan.model.apartment.service

import org.jetbrains.exposed.sql.selectAll
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.Room
import pl.chodan.model.apartment.database.Apartment
import pl.chodan.model.apartment.dto.ApartmentWithRooms
import pl.chodan.model.apartment.dto.RoomDetails

class ApartmentService : KoinComponent {

    private val databaseProvider by inject<DatabaseProviderContract>()

    suspend fun getAllApartmentsWithRoomDetails(): List<ApartmentWithRooms> = databaseProvider.dbQuery {
        (Apartment leftJoin Room)
            .selectAll()
            .toSet()
            .groupBy { it[Apartment.id] }
            .map { (apartmentId, rows) ->
                val firstRow = rows.first()
                ApartmentWithRooms(
                    apartmentId = apartmentId,
                    apartmentName = firstRow[Apartment.name],
                    rooms = rows.filter { it.getOrNull(Room.id) != null }.map { row ->
                        RoomDetails(
                            roomId = row[Room.id],
                            roomName = row[Room.name],
                            apartmentId = row[Room.apartmentId]!!
                        )
                    }
                )
            }
    }


}