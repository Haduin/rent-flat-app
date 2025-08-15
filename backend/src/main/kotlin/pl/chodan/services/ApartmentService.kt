package pl.chodan.services

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.ApartmentAndRoomNumberDTO
import pl.chodan.database.Apartment
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.Room

class ApartmentService : KoinComponent {

    private val databaseProvider by inject<DatabaseProviderContract>()


    suspend fun createApartment(name: String): Int = databaseProvider.dbQuery {
        Apartment.insert {
            it[Apartment.name] = name
        } get Apartment.id
    }

    suspend fun getApartmentById(id: Int): ResultRow? = databaseProvider.dbQuery {
        Apartment.selectAll().where { Apartment.id eq id }.singleOrNull()
    }

    suspend fun getAllApartmentsWithRoomDetails(): List<ApartmentAndRoomNumberDTO> = databaseProvider.dbQuery {
        (Apartment innerJoin Room)
            .select(
                Apartment.name, Room.id.count()
            )
            .groupBy(Apartment.name)
            .map {
                ApartmentAndRoomNumberDTO(
                    apartmentName = it[Apartment.name],
                    roomName = it[Room.id.count()].toString(),
                )
            }
    }


    suspend fun deleteApartment(id: Int): Int = databaseProvider.dbQuery {
        Apartment.deleteWhere { Apartment.id eq id }
    }

}