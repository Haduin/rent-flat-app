package pl.chodan.services

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import pl.chodan.Apartment
import pl.chodan.ApartmentAndRoomNumberDTO
import pl.chodan.Room
import pl.chodan.dbQuery

class ApartmentService {
    suspend fun createApartment(name: String): Int = dbQuery {
        Apartment.insert {
            it[Apartment.name] = name
        } get Apartment.id
    }

    suspend fun getApartmentById(id: Int): ResultRow? = dbQuery {
        Apartment.selectAll().where { Apartment.id eq id }.singleOrNull()
    }

    suspend fun getAllApartmentsWithRoomDetails(): List<ApartmentAndRoomNumberDTO> = dbQuery {
        Apartment
            .innerJoin(Room)
            .select(Apartment.name, Room.name.count())
            .groupBy(Apartment.name)
            .map { row ->
                ApartmentAndRoomNumberDTO(
                    apartmentName = row[Apartment.name],
                    roomName = row[Room.name.count()].toString(),
                )
            }

    }

    suspend fun deleteApartment(id: Int): Int = dbQuery {
        Apartment.deleteWhere { Apartment.id eq id }
    }

}
