package pl.chodan

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

//class UtilityCostsService {
//
//
//    suspend fun addCost(request: AddNewUtilityCostDTO) = dbQuery {
//        UtilityCosts.insert {
//            it[type] = request.type
//            it[insertDate] = formatToFullTimestamp(request.insertDate)
//            it[apartmentId] = request.apartmentId
//            it[value] = request.amount.toBigDecimal()
//        }
//    }
//
//    suspend fun getAllCostsForApartment(apartmentId: Int) = dbQuery {
//        UtilityCosts.selectAll().where { UtilityCosts.apartmentId eq apartmentId }.toList()
//    }
//
//}

// Service for Apartment(
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

// Service for Room
class RoomService {
    suspend fun createRoom(name: String, apartmentId: Int?): Int = dbQuery {
        Room.insert {
            it[Room.name] = name
            it[Room.apartmentId] = apartmentId
        } get Room.id
    }

    suspend fun getRoomById(id: Int): RoomDTO? = dbQuery {
        Room.selectAll()
            .where { Room.id eq id }
            .map {
                RoomDTO(
                    it[Room.id],
                    it[Room.name],
                    it[Room.apartmentId],
                )
            }
            .singleOrNull()
    }

    suspend fun getAllRooms(): List<RoomDTO> = dbQuery {
        Room.selectAll()
            .map {
                RoomDTO(
                    it[Room.id],
                    it[Room.name],
                    it[Room.apartmentId],
                )
            }.toList()
    }

    suspend fun getRoomsWithAparts(): MutableList<RoomWithApartmentDTO> = dbQuery {
        val sqlQuery =
            "select  a.name as apartment_name, r.id as room_id, r.name as room_name " +
                    "from flat.apartment a, flat.room r where a.id = r.apartment_id"
        transaction {
            val result = mutableListOf<RoomWithApartmentDTO>()
            exec(sqlQuery) { rs ->
                while (rs.next()) {
                    result.add(
                        RoomWithApartmentDTO(
                            rs.getInt("room_id"),
                            rs.getString("room_name"),
                            rs.getString("apartment_name")
                        )
                    )
                }
            }
            result
        }
    }

    suspend fun fetchFreeRoomsBetweenDates(startDate: String, endDate: String): List<RoomWithApartmentDTO> = dbQuery {
        val sql = "SELECT r.id, r.name as number, a.name as apartment " +
                "FROM flat.room r, flat.apartment a " +
                "WHERE r.apartment_id = a.id and r.id NOT IN ( " +
                "    SELECT c.room_id " +
                "    FROM contract c " +
                "    WHERE c.start_date >= '$startDate' AND c.end_date <= '$endDate'" +
                ");"

        transaction {
            val result = mutableListOf<RoomWithApartmentDTO>()
            exec(sql) { rs ->
                while (rs.next()) {
                    result.add(
                        RoomWithApartmentDTO(
                            rs.getInt("id"),
                            rs.getString("number"),
                            rs.getString("apartment")
                        )
                    )
                }
            }
            result
        }
    }

    suspend fun updateRoom(id: Int, name: String, apartmentId: Int?): Int = dbQuery {
        Room.update({ Room.id eq id }) { room ->
            room[Room.name] = name
            room[Room.apartmentId] = apartmentId
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

    suspend fun getPersonById(id: Int): PersonDTO? = dbQuery {
        Person.selectAll()
            .where { Person.id eq id }
            .map {
                PersonDTO(
                    it[Person.id],
                    it[Person.firstName],
                    it[Person.lastName],
                    it[Person.documentNumber],
                    it[Person.nationality],
                    it[Person.status].name
                )
            }
            .singleOrNull()
    }

    suspend fun getAllPersons(): List<PersonDTO> = dbQuery {
        Person.selectAll()
            .toList()
            .map {
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
            .toList()
            .map {
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

// Service for Contract
class ContractService {

    suspend fun generateNewPaymentsForActiveContracts() = dbQuery {
        // znajdz kontrakt miedzy datami start i end date
        // następnie wygeneruj nowy payment
        Contract.selectAll()
            .where { (Contract.endDate greater LocalDate.now()) }
            .map { row ->
                RawContract(
                    id = row[Contract.id],
                    personId = row[Contract.personId],
                    roomId = row[Contract.roomId],
                    startDate = row[Contract.startDate].toString(),
                    endDate = row[Contract.endDate].toString(),
                    dueDate = row[Contract.payedTillDayOfMonth],
                    amount = row[Contract.amount].toDouble(),
                    deposit = row[Contract.deposit].toDouble(),
                )
            }
            .forEach { contract -> PaymentService().createPayments(contract) }

    }

    suspend fun createContract(newContractDTO: NewContractDTO): Int = dbQuery {
        Person.update {
            it[status] = PersonStatus.RESIDENT
        }
        Contract.insert {
            it[personId] = newContractDTO.personId
            it[roomId] = newContractDTO.roomId
            it[amount] = newContractDTO.amount.toBigDecimal()
            it[startDate] = LocalDate.parse(newContractDTO.startDate)
            it[endDate] = LocalDate.parse(newContractDTO.endDate)
            it[deposit] = newContractDTO.deposit.toBigDecimal()
            it[payedTillDayOfMonth] = newContractDTO.payedDate.toString()
        } get Contract.id
    }

    suspend fun getContractById(id: Int): ContractDB? = dbQuery {
        Contract.selectAll()
            .where { Contract.id eq id }
            .singleOrNull()?.let { resultRow ->
                ContractDB(
                    id = resultRow[Contract.id],
                    personId = resultRow[Contract.personId],
                    roomId = resultRow[Contract.roomId],
                    amount = resultRow[Contract.amount],
                    deposit = resultRow[Contract.deposit],
                    startDate = resultRow[Contract.startDate].toString(),
                    endDate = resultRow[Contract.endDate].toString(),
                )
            }
    }

    suspend fun getAllContractsWithRoomAndPersonDetails(): List<ContractDTO> = dbQuery {
        val roomsAparts = RoomService().getRoomsWithAparts()
        val persons = PersonService().getAllPersons()
        Contract.selectAll().toList().map { contract ->
            ContractDTO(
                id = contract[Contract.id],
                person = persons.find { person -> person.id == contract[Contract.personId] },
                room = roomsAparts.find { rooms -> rooms.id == contract[Contract.roomId] },
                startDate = contract[Contract.startDate].toString(),
                endDate = contract[Contract.endDate].toString(),
                amount = contract[Contract.amount].toDouble(),
                deposit = contract[Contract.deposit].toDouble()
            )
        }
    }

    suspend fun updateContract(id: Int, personId: Int, roomId: Int, amount: Double): Int = dbQuery {
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

    suspend fun createPayments(contract: RawContract) = dbQuery {
        checkIfPendingPaymentExistsForContract(contract.id)
            .takeUnless { it }?.let {
                Payment.insert {
                    it[contractId] = contract.id
                    it[amount] = contract.amount?.toBigDecimal() ?: BigDecimal.ZERO
                    it[payedDate] = null
                    it[scopeDate] = LocalDate.now().toFormattedString()
                    it[status] = PaymentStatus.PENDING
                }
            }
    }

    private suspend fun checkIfPendingPaymentExistsForContract(contractId: Int) = dbQuery {
        Payment.selectAll()
            .where {
                (Payment.contractId eq contractId) and ((Payment.status eq PaymentStatus.PENDING) or (Payment.status eq PaymentStatus.PAID))
            }
            .singleOrNull() != null


    }

    suspend fun getAllPayments(): List<PaymentDTO> = dbQuery {
        Payment.selectAll().toList().map { resultRow ->
            PaymentDTO(
                id = resultRow[Payment.id],
                contractId = resultRow[Payment.contractId],
                scopeDate = resultRow[Payment.scopeDate],
                payedDate = resultRow[Payment.payedDate]?.toString() ?: null,
                amount = resultRow[Payment.amount].toDouble(),
                status = resultRow[Payment.status]
            )
        }
    }

    suspend fun getPaymentsForMouth(mouth: String) = dbQuery {
        //todo tutaj duzo zapytań bedzie leciało wiec pozniej refaktor tego
        val roomsAparts = RoomService().getRoomsWithAparts()
        Payment.selectAll()
            .where { Payment.scopeDate eq mouth }
            .map { payments ->

                val contractDB = ContractService().getContractById(payments[Payment.contractId])
                ContractService().getContractById(payments[Payment.contractId])?.let {
                    val room = roomsAparts.find { room -> room.id == it.roomId }
                    val person = PersonService().getPersonById(it.personId)?.let { person ->
                        PersonSmallDetailsDTO(
                            id = person.id,
                            firstName = person.firstName,
                            lastName = person.lastName
                        )
                    }
                    PaymentHistoryWithPersonDTO(
                        id = payments[Payment.id],
                        contractId = payments[Payment.contractId],
                        scopeDate = payments[Payment.scopeDate],
                        payedDate = payments[Payment.payedDate]?.toString() ?: null,
                        amount = payments[Payment.amount].toDouble(),
                        person = person,
                        status = payments[Payment.status],
                        room = room
                    )
                }
            }
    }

    suspend fun confirmPayment(paymentDto: PaymentConfirmationDTO) = dbQuery {
        Payment.update({ Payment.id eq paymentDto.paymentId }) {
            it[status] = PaymentStatus.PAID
            it[payedDate] = paymentDto.paymentDate.toLocalDateWithFullPattern()
            it[amount] = BigDecimal.valueOf(paymentDto.payedAmount)
        }
    }
}

private suspend fun <T> dbQuery(block: suspend () -> T): T =
    newSuspendedTransaction(Dispatchers.IO) { block() }

private fun LocalDate.toFormattedString() = this.format(DateTimeFormatter.ofPattern("yyyy-MM"))
private fun formatToFullTimestamp(input: String, inputPattern: String = "yyyy-MM-dd"): String {
    val parsedDate = LocalDateTime.parse("$input 00:00:00", DateTimeFormatter.ofPattern("$inputPattern HH:mm:ss"))
    return parsedDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
}

private fun LocalDateTime.toFormattedString(pattern: String = "yyyy-MM-dd HH:mm:ss"): String {
    val formatter = DateTimeFormatter.ofPattern(pattern)
    return this.format(formatter)
}

private fun String.toLocalDateWithFullPattern() = LocalDate.parse(this, DateTimeFormatter.ofPattern("yyyy-MM-dd"))
private fun String.toLocalDateWithYearMonth() = LocalDate.parse(this, DateTimeFormatter.ofPattern("yyyy-MM"))
