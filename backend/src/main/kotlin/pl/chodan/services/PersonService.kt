package pl.chodan.services

import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import pl.chodan.*

class PersonService {
    suspend fun createPerson(createdPersonDTO: CreatedPersonDTO): Int = dbQuery {
        Person.insert {
            it[firstName] = createdPersonDTO.firstName
            it[lastName] = createdPersonDTO.lastName
            it[documentNumber] = createdPersonDTO.documentNumber
            it[nationality] = createdPersonDTO.nationality
            it[status] = PersonStatus.NON_RESIDENT
        } get Person.id
    }

    suspend fun getPersonById(id: Int): PersonDTO? = dbQuery {
        Person.selectAll().where { Person.id eq id }.map {
            PersonDTO(
                it[Person.id],
                it[Person.firstName],
                it[Person.lastName],
                it[Person.documentNumber],
                it[Person.nationality],
                it[Person.status].name
            )
        }.singleOrNull()
    }

    suspend fun getAllPersons(): List<PersonDTO> = dbQuery {
        Person.selectAll().toList().map {
            PersonDTO(
                it[Person.id],
                it[Person.firstName],
                it[Person.lastName],
                it[Person.documentNumber],
                it[Person.nationality],
                it[Person.status].name
            )
        }
    }

    suspend fun getNonResidentPersons(): List<PersonDTO> = dbQuery {
        Person.selectAll()
            .where { Person.status eq PersonStatus.NON_RESIDENT }
            .toList().map {
                PersonDTO(
                    it[Person.id],
                    it[Person.firstName],
                    it[Person.lastName],
                    it[Person.documentNumber],
                    it[Person.nationality],
                    it[Person.status].name
                )
            }
    }

    suspend fun updatePerson(
        personToUpdate: UpdatePersonDTO
    ): Int = dbQuery {
        Person.update({ Person.id eq personToUpdate.id }) {
            it[firstName] = personToUpdate.firstName
            it[lastName] = personToUpdate.lastName
            it[documentNumber] = personToUpdate.documentNumber
            it[nationality] = personToUpdate.nationality
        }
    }

    suspend fun deletePerson(id: Int): Int = dbQuery {
        Person.deleteWhere { Person.id eq id }
    }
}
