package pl.chodan.model.persons.service

import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import org.jetbrains.exposed.sql.vendors.ForUpdateOption
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.Person
import pl.chodan.database.PersonStatus
import pl.chodan.model.contract.database.Contract
import pl.chodan.model.persons.dto.CreatedPersonDTO
import pl.chodan.model.persons.dto.PersonDTO
import pl.chodan.model.persons.dto.UpdatePersonDTO

class PersonService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()

    suspend fun createPerson(createdPersonDTO: CreatedPersonDTO): Int = databaseProvider.dbQuery {
        Person.insert {
            it[firstName] = createdPersonDTO.firstName
            it[lastName] = createdPersonDTO.lastName
            it[documentNumber] = createdPersonDTO.documentNumber
            it[nationality] = createdPersonDTO.nationality
            it[status] = PersonStatus.NON_RESIDENT
        } get Person.id
    }

    suspend fun getPersonById(id: Int): PersonDTO? = databaseProvider.dbQuery {
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

    suspend fun getAllPersons(): List<PersonDTO> = databaseProvider.dbQuery {
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

    suspend fun getNonResidentPersons(): List<PersonDTO> = databaseProvider.dbQuery {
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

    suspend fun updatePerson(id: Int, personToUpdate: UpdatePersonDTO) = databaseProvider.dbQuery {
        val updated = Person.update({ Person.id eq id }) {
            it[firstName] = personToUpdate.firstName
            it[lastName] = personToUpdate.lastName
            it[documentNumber] = personToUpdate.documentNumber
            it[nationality] = personToUpdate.nationality
        }
        if (0 == updated) throw PersonError.NotFound(id)
    }

    suspend fun deletePerson(id: Int): Unit = databaseProvider.dbQuery {
        val exists = Person.selectAll().where { Person.id eq id }.forUpdate().any()
        if (!exists) throw PersonError.NotFound(id)
        if (Contract.selectAll().where { Contract.personId eq id }.any()) throw PersonError.InUse()
        Person.deleteWhere { Person.id eq id }
    }
}

/**
 * Existence check for a person referenced by another row. Call inside `dbQuery`.
 * KEY SHARE conflicts only with FOR UPDATE/DELETE (deletePerson), not with FK checks or other pre-checks, so it cannot deadlock.
 */
internal fun lockPerson(id: Int) {
    val exists = Person.selectAll().where { Person.id eq id }.forUpdate(ForUpdateOption.PostgreSQL.ForKeyShare).any()
    if (!exists) throw PersonError.NotFound(id)
}