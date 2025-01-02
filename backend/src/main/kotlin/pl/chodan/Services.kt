package pl.chodan

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction

// Service for Apartment
class ApartmentService {
    suspend fun createApartment(name: String): Int = dbQuery {
        Apartment.insert {
            it[Apartment.name] = name
        } get Apartment.id
    }

    suspend fun getApartmentById(id: Int): ResultRow? = dbQuery {
        Apartment.selectAll().where { Apartment.id eq id }.singleOrNull()
    }

    suspend fun getAllApartments(): List<ApartmentDTO> = dbQuery {
        Apartment.selectAll().toList().map {
            ApartmentDTO(it[Apartment.id], it[Apartment.name])
        }
    }

    suspend fun deleteApartment(id: Int): Int = dbQuery {
        Apartment.deleteWhere { Apartment.id eq id }
    }
}

// Service for Room
class RoomService {
    suspend fun createRoom(name: String, apartmentId: Int?): Int = dbQuery {
        Room.insert {
            it[Room.name] = name
            it[Room.apartmentId] = apartmentId
        } get Room.id
    }

    suspend fun getRoomById(id: Int): ResultRow? = dbQuery {
        Room.selectAll().where { Room.id eq id }.singleOrNull()
    }

    suspend fun getAllRooms(): List<ResultRow> = dbQuery {
        Room.selectAll().toList()
    }

    suspend fun updateRoom(id: Int, name: String, apartmentId: Int?): Int = dbQuery {
        Room.update({ Room.id eq id }) {
            it[Room.name] = name
            it[Room.apartmentId] = apartmentId
        }
    }

    suspend fun deleteRoom(id: Int): Int = dbQuery {
        Room.deleteWhere { Room.id eq id }
    }
}

// Service for Person
class PersonService {
    suspend fun createPerson(createdPersonDTO: CreatedPersonDTO): Int =
        dbQuery {
            Person.insert {
                it[firstName] = createdPersonDTO.firstName
                it[lastName] = createdPersonDTO.lastName
                it[documentNumber] = createdPersonDTO.documentNumber
                it[nationality] = createdPersonDTO.nationality
                it[status] = PersonStatus.NON_RESIDENT
            } get Person.id
        }

    suspend fun getPersonById(id: Int): ResultRow? = dbQuery {
        Person.selectAll().where { Person.id eq id }.singleOrNull()
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

    suspend fun updatePerson(
        personToUpdate: UpdatePersonDTO
    ): Int = dbQuery {
        println(personToUpdate)
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

// Service for Contract
class ContractService {
    suspend fun createContract(personId: Int, roomId: Int?, amount: Double): Int = dbQuery {
        Contract.insert {
            it[Contract.personId] = personId
            it[Contract.roomId] = roomId
            it[Contract.amount] = amount.toBigDecimal()
        } get Contract.id
    }

    suspend fun getContractById(id: Int): ResultRow? = dbQuery {
        Contract.selectAll().where { Contract.id eq id }.singleOrNull()
    }

    suspend fun getAllContracts(): List<ContractDTO> = dbQuery {
        Contract.selectAll().toList().map {
            ContractDTO(
                id = it[Contract.id],
                personId = it[Contract.personId],
                roomId = it[Contract.roomId],
                startDate = it[Contract.startDate]?.toString(),
                endDate = it[Contract.endDate]?.toString(),
                amount = it[Contract.amount].toDouble(),
            )
        }
    }

    fun updateContract(id: Int, personId: Int, roomId: Int?, amount: Double): Int = transaction {
        Contract.update({ Contract.id eq id }) {
            it[Contract.personId] = personId
            it[Contract.roomId] = roomId
            it[Contract.amount] = amount.toBigDecimal()
        }
    }

    suspend fun deleteContract(id: Int): Int = dbQuery {
        Contract.deleteWhere { Contract.id eq id }
    }
}

class PaymentService {
    // Pobierz wszystkie płatności
    suspend fun getAllPayments(): List<PaymentDTO> = dbQuery {
        Payment.selectAll().toList().map { resultRow ->
            PaymentDTO(
                id = resultRow[Payment.id],
                contractId = resultRow[Payment.contractId],
                dueDate = resultRow[Payment.dueDate]?.toString() ?: null, // Zamiana LocalDate na String
                payedDate = resultRow[Payment.payedDate]?.toString() ?: null,
                amount = resultRow[Payment.amount].toDouble(), // Zamiana BigDecimal na Double
                status = resultRow[Payment.status]
            )
        }
    }

    suspend fun getAllPaymentsForCurrentMouth() {

    }

    // Pobierz płatności dla konkretnego kontraktu
    suspend fun getPaymentsByContract(contractId: Int): List<ResultRow> = dbQuery {
        Payment.selectAll().where { Payment.contractId eq contractId }.toList()
    }

    // Pobierz wszystkie płatności z określonym statusem (np. "PENDING", "PAID")
    suspend fun getPaymentsByStatus(status: PaymentStatus): List<ResultRow> = dbQuery {
        Payment.selectAll().where { Payment.status eq status }.toList()
    }

    // Aktualizuj status płatności
    suspend fun updatePaymentStatus(paymentId: Int, newStatus: PaymentStatus): Boolean = dbQuery {
        Payment.update({ Payment.id eq paymentId }) {
            it[status] = newStatus
        } > 0
    }

    // Usuń płatność
    suspend fun deletePayment(paymentId: Int): Boolean = dbQuery {
        Payment.deleteWhere { id eq paymentId } > 0
    }
}

private suspend fun <T> dbQuery(block: suspend () -> T): T =
    newSuspendedTransaction(Dispatchers.IO) { block() }