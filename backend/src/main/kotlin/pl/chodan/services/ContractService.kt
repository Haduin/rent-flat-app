package pl.chodan.services

import org.jetbrains.exposed.sql.*
import org.slf4j.LoggerFactory
import pl.chodan.*
import java.time.LocalDate

class ContractService {
    private val logger = LoggerFactory.getLogger(pl.chodan.services.ContractService::class.java)

    suspend fun generateNewPaymentsForActiveContracts(yearMonth: String) = dbQuery {
        // znajdz kontrakt miedzy datami start i end date
        // następnie wygeneruj nowy payment
        Contract.selectAll().where {
            (Contract.endDate greater LocalDate.now()) and (Contract.status eq ContractStatus.ACTIVE)
        }.map { row ->
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
        }.forEach { contract -> PaymentService().createPayments(contract, yearMonth) }

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
        (Contract
            .join(Person, JoinType.INNER, Contract.personId, Person.id)
            .join(Room, JoinType.INNER, Contract.roomId, Room.id)
            .join(Apartment, JoinType.INNER, Room.apartmentId, Apartment.id))
            .select(
                Contract.columns +
                        Person.columns +
                        Room.name +
                        Room.id +
                        Apartment.id +
                        Apartment.name
            )
            .map { row ->
                ContractDTO(
                    id = row[Contract.id],
                    person = PersonDTO(
                        id = row[Person.id],
                        firstName = row[Person.firstName],
                        lastName = row[Person.lastName],
                        documentNumber = row[Person.documentNumber],
                        nationality = row[Person.nationality],
                        status = row[Person.status].name
                    ),
                    room = RoomWithApartmentDTO(
                        id = row[Room.id],
                        number = row[Room.name],
                        apartment = row[Apartment.name]
                    ),
                    startDate = row[Contract.startDate].toString(),
                    endDate = row[Contract.endDate].toString(),
                    amount = row[Contract.amount].toDouble(),
                    deposit = row[Contract.deposit].toDouble(),
                    status = row[Contract.status].name,
                    terminationDate = row[Contract.terminationDate]?.toString(),
                    payedTillDayOfMonth = row[Contract.payedTillDayOfMonth],
                    depositReturned = row[Contract.depositReturned],
                    description = row[Contract.description]
                )
            }
    }


    suspend fun deleteContract(details: DeleteContractDTO): ContractDeleteResult = dbQuery {
        try {
            Contract.selectAll().where { Contract.id eq details.contractId }
                .singleOrNull() ?: return@dbQuery ContractDeleteResult.NotFound

            val updatedPayments = Payment.update({
                (Payment.contractId eq details.contractId) and
                        (Payment.status eq PaymentStatus.PENDING)
            }) {
                it[status] = PaymentStatus.CANCELLED
                it[payedDate] = details.terminationDate.toLocalDateWithFullPattern()
            }

            if (updatedPayments < 0) {
                return@dbQuery ContractDeleteResult.PaymentUpdateError(
                    "Błąd podczas aktualizacji płatności dla kontraktu ${details.contractId}"
                )
            }

            val updatedContract = Contract.update({ Contract.id eq details.contractId }) {
                it[Contract.terminationDate] = details.terminationDate.toLocalDateWithFullPattern()
                it[Contract.status] = ContractStatus.TERMINATED
                it[Contract.depositReturned] = details.depositReturned
                it[Contract.description] = details.description
            }

            when (updatedContract) {
                1 -> ContractDeleteResult.Success(details.contractId)
                0 -> ContractDeleteResult.ContractUpdateError("Nie znaleziono kontraktu do aktualizacji")

                else -> ContractDeleteResult.ContractUpdateError(
                    "Nieoczekiwana liczba zaktualizowanych kontraktów: $updatedContract"
                )
            }
        } catch (e: Exception) {
            logger.error("Błąd podczas usuwania kontraktu: ${e.message}", e)
            ContractDeleteResult.ContractUpdateError(
                "Wystąpił błąd podczas usuwania kontraktu: ${e.message}"
            )
        }
    }

}

sealed class ContractDeleteResult {
    data class Success(val contractId: Int) : ContractDeleteResult()
    data class PaymentUpdateError(val message: String) : ContractDeleteResult()
    data class ContractUpdateError(val message: String) : ContractDeleteResult()
    data object NotFound : ContractDeleteResult()
}