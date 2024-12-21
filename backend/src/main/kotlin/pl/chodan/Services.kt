package pl.chodan

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDate

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
    suspend fun createPerson(firstName: String, lastName: String, documentNumber: String, nationality: String): Int =
        dbQuery {
            Person.insert {
                it[Person.firstName] = firstName
                it[Person.lastName] = lastName
                it[Person.documentNumber] = documentNumber
                it[Person.nationality] = nationality
            } get Person.id
        }

    suspend fun getPersonById(id: Int): ResultRow? = dbQuery {
        Person.selectAll().where { Person.id eq id }.singleOrNull()
    }

    suspend fun getAllPersons(): List<ResultRow> = dbQuery {
        Person.selectAll().toList()
    }

    suspend fun updatePerson(
        id: Int,
        firstName: String,
        lastName: String,
        documentNumber: String,
        nationality: String,
        roomId: Int?
    ): Int = dbQuery {
        Person.update({ Person.id eq id }) {
            it[Person.firstName] = firstName
            it[Person.lastName] = lastName
            it[Person.documentNumber] = documentNumber
            it[Person.nationality] = nationality
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

    suspend fun getAllContracts(): List<ResultRow> = dbQuery {
        Contract.selectAll().toList()
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
    suspend fun getAllPayments(): List<ResultRow> = dbQuery {
        Payment.selectAll().toList()
    }

    // Pobierz płatności dla konkretnego kontraktu
    suspend fun getPaymentsByContract(contractId: Int): List<ResultRow> = dbQuery {
        Payment.selectAll().where { Payment.contractId eq contractId }.toList()
    }

    // Pobierz wszystkie płatności z określonym statusem (np. "PENDING", "PAID")
    suspend fun getPaymentsByStatus(status: String): List<ResultRow> = dbQuery {
        Payment.selectAll().where { Payment.status eq status }.toList()
    }

    // Aktualizuj status płatności
    suspend fun updatePaymentStatus(paymentId: Int, newStatus: String): Boolean = dbQuery {
        Payment.update({ Payment.id eq paymentId }) {
            it[Payment.status] = newStatus
        } > 0
    }

    // Usuń płatność
    suspend fun deletePayment(paymentId: Int): Boolean = dbQuery {
        Payment.deleteWhere { Payment.id eq paymentId } > 0
    }

    suspend fun generatePaymentsForNextMonth() {
        dbQuery {
            val nextMonthDate = LocalDate.now().plusMonths(1).withDayOfMonth(1)

            Contract.selectAll().forEach { contract ->
                val contractId = contract[Contract.id]
                val amount = contract[Contract.amount]

                // Dodaj płatność tylko jeśli już nie istnieje płatność dla danego miesiąca
                val existingPayment = Payment.selectAll().where {
                    (Payment.contractId eq contractId) and
                            (Payment.dueDate eq nextMonthDate)
                }.singleOrNull()

                if (existingPayment == null) {
                    Payment.insert {
                        it[Payment.contractId] = contractId
                        it[Payment.dueDate] = nextMonthDate
                        it[Payment.amount] = amount
                        it[Payment.status] = "PENDING"
                    }
                }
            }
        }
    }
}

private suspend fun <T> dbQuery(block: suspend () -> T): T =
    newSuspendedTransaction(Dispatchers.IO) { block() }