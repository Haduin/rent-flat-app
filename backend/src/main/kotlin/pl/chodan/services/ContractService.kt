package pl.chodan.services

import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import pl.chodan.*
import java.time.LocalDate

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
        Person.update({ Person.id eq newContractDTO.personId }) {
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