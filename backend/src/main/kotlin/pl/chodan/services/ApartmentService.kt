package pl.chodan.services

import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import pl.chodan.Apartment
import pl.chodan.ApartmentAndRoomNumberDTO
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
        val sqlQuery: String = """
            select a.name as apartment_name, count(r.name) as room_count from flat.apartment a, flat.room r
            where a.id = r.apartment_id
            group by a.name
        """.trimIndent()

        transaction {
            val result = mutableListOf<ApartmentAndRoomNumberDTO>()
            exec(sqlQuery) { rs ->
                while (rs.next()) {
                    result.add(
                        ApartmentAndRoomNumberDTO(
                            rs.getString("apartment_name"),
                            rs.getString("room_count")
                        )
                    )
                }
            }
            result
        }
    }

    suspend fun deleteApartment(id: Int): Int = dbQuery {
        Apartment.deleteWhere { Apartment.id eq id }
    }

}
