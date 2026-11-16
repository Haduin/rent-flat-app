package pl.chodan.model.apartment.service

import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.vendors.ForUpdateOption
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.OperationalExpense
import pl.chodan.database.OperationalExpenseTemplate
import pl.chodan.database.Room
import pl.chodan.model.apartment.database.Apartment
import pl.chodan.model.apartment.dto.ApartmentResponse
import pl.chodan.model.apartment.dto.ApartmentWithRooms
import pl.chodan.model.apartment.dto.RoomDetails
import pl.chodan.model.contract.database.Contract
import pl.chodan.model.room.dto.RoomResponse

class ApartmentService : KoinComponent {

    private val databaseProvider by inject<DatabaseProviderContract>()

    suspend fun getAllApartmentsWithRoomDetails(): List<ApartmentWithRooms> = databaseProvider.dbQuery {
        (Apartment leftJoin Room)
            .selectAll()
            .orderBy(Apartment.id to SortOrder.ASC, Room.id to SortOrder.ASC)
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

    suspend fun createApartment(name: String): ApartmentResponse = databaseProvider.dbQuery {
        val id = Apartment.insert { it[Apartment.name] = name }[Apartment.id]
        ApartmentResponse(id = id, name = name)
    }

    suspend fun renameApartment(apartmentId: Int, name: String) = databaseProvider.dbQuery {
        if (0 == Apartment.update({ Apartment.id eq apartmentId }) { it[Apartment.name] = name }) {
            throw ApartmentError.NotFound(apartmentId)
        }
    }

    suspend fun createRoom(apartmentId: Int, name: String): RoomResponse = databaseProvider.dbQuery {
        requireApartment(apartmentId)
        val id = Room.insert {
            it[Room.name] = name
            it[Room.apartmentId] = apartmentId
        }[Room.id]
        RoomResponse(id = id, name = name, apartmentId = apartmentId)
    }

    suspend fun renameRoom(apartmentId: Int, roomId: Int, name: String) = databaseProvider.dbQuery {
        if (0 == Room.update({ (Room.id eq roomId) and (Room.apartmentId eq apartmentId) }) { it[Room.name] = name }) {
            throw ApartmentError.RoomNotFound(roomId)
        }
    }

    /** Only a room nothing points at can go: any contract, cost or cost template keeps it (history must stay intact). */
    suspend fun deleteRoom(apartmentId: Int, roomId: Int): Unit = databaseProvider.dbQuery {
        val exists = Room.selectAll().where { (Room.id eq roomId) and (Room.apartmentId eq apartmentId) }.forUpdate().any()
        if (!exists) throw ApartmentError.RoomNotFound(roomId)
        val inUse = Contract.selectAll().where { Contract.roomId eq roomId }.any() ||
                OperationalExpense.selectAll().where { OperationalExpense.roomId eq roomId }.any() ||
                OperationalExpenseTemplate.selectAll().where { OperationalExpenseTemplate.roomId eq roomId }.any()
        if (inUse) throw ApartmentError.RoomInUse()
        Room.deleteWhere { Room.id eq roomId }
    }
}

/** Existence check only, no lock: apartments are never deleted. Call inside `dbQuery`. */
internal fun requireApartment(id: Int) {
    if (Apartment.selectAll().where { Apartment.id eq id }.empty()) throw ApartmentError.NotFound(id)
}

/**
 * Existence check for a room referenced by another row. Call inside `dbQuery`.
 * KEY SHARE conflicts only with FOR UPDATE/DELETE (deleteRoom), not with FK checks or other pre-checks, so it cannot deadlock.
 */
internal fun lockRoom(id: Int) {
    val exists = Room.selectAll().where { Room.id eq id }.forUpdate(ForUpdateOption.PostgreSQL.ForKeyShare).any()
    if (!exists) throw ApartmentError.RoomNotFound(id)
}
