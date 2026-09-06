package pl.chodan.model.contract.service

import org.jetbrains.exposed.sql.*
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import org.slf4j.LoggerFactory
import pl.chodan.database.*
import pl.chodan.model.apartment.database.Apartment
import pl.chodan.model.contract.database.Contract
import pl.chodan.model.contract.database.ContractChangeType
import pl.chodan.model.contract.database.ContractHistory
import pl.chodan.model.contract.database.ContractStatus
import pl.chodan.model.contract.dto.*
import pl.chodan.model.persons.dto.PersonDTO
import pl.chodan.model.room.dto.RoomWithApartmentDTO
import pl.chodan.toLocalDateWithFullPattern
import java.time.LocalDate
import java.time.LocalDateTime

class ContractService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()
    private val logger = LoggerFactory.getLogger(ContractService::class.java)

    suspend fun createContract(newContractDTO: NewContractDTO): Int = databaseProvider.dbQuery {
        Person.update({ Person.id eq newContractDTO.personId }) {
            it[status] = PersonStatus.RESIDENT
        }
        val contractId = Contract.insert {
            it[personId] = newContractDTO.personId
            it[roomId] = newContractDTO.roomId
            it[amount] = newContractDTO.amount.toBigDecimal()
            it[startDate] = LocalDate.parse(newContractDTO.startDate)
            it[endDate] = LocalDate.parse(newContractDTO.endDate)
            it[status] = ContractStatus.ACTIVE
            it[deposit] = newContractDTO.deposit.toBigDecimal()
            it[payedTillDayOfMonth] = newContractDTO.payedDate.toString()
        } get Contract.id

        recordContractHistory(contractId, ContractChangeType.CREATED)
        contractId
    }

    suspend fun getContractById(id: Int): ContractDB? = databaseProvider.dbQuery {
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

    suspend fun updateContract(contractDetails: UpdateContractDetails) = databaseProvider.dbQuery {
        Contract.update({ Contract.id eq contractDetails.contractId }) {
            contractDetails.roomId?.let { value -> it[roomId] = value }
            contractDetails.amount?.let { value -> it[amount] = value.toBigDecimal() }
            contractDetails.deposit?.let { value -> it[deposit] = value.toBigDecimal() }
            contractDetails.startDate?.let { value -> it[startDate] = value.toLocalDateWithFullPattern() }
            contractDetails.endDate?.let { value -> it[endDate] = value.toLocalDateWithFullPattern() }
            contractDetails.payedTillDayOfMonth?.let { value -> it[payedTillDayOfMonth] = value }
        }
        recordContractHistory(contractDetails.contractId, ContractChangeType.UPDATED)
    }

    /**
     * Writes a full snapshot of the contract's current row into ContractHistory, tagged with
     * [changeType]. Must be called from inside an already-open dbQuery transaction (create/update/
     * delete), never wraps its own transaction, so the history row is committed atomically with
     * the change that produced it.
     */
    private fun recordContractHistory(contractId: Int, changeType: ContractChangeType) {
        val row = Contract.selectAll().where { Contract.id eq contractId }.singleOrNull() ?: return
        ContractHistory.insert {
            it[ContractHistory.contractId] = contractId
            it[ContractHistory.changeType] = changeType
            it[changedAt] = LocalDateTime.now()
            it[roomId] = row[Contract.roomId]
            it[amount] = row[Contract.amount]
            it[deposit] = row[Contract.deposit]
            it[depositReturned] = row[Contract.depositReturned]
            it[startDate] = row[Contract.startDate]
            it[endDate] = row[Contract.endDate]
            it[terminationDate] = row[Contract.terminationDate]
            it[description] = row[Contract.description]
            it[status] = row[Contract.status]
            it[payedTillDayOfMonth] = row[Contract.payedTillDayOfMonth]
        }
    }

    suspend fun getContractHistory(contractId: Int): List<ContractHistoryDTO> = databaseProvider.dbQuery {
        ContractHistory.selectAll()
            .where { ContractHistory.contractId eq contractId }
            .orderBy(ContractHistory.changedAt to SortOrder.ASC)
            .map { row ->
                ContractHistoryDTO(
                    id = row[ContractHistory.id],
                    contractId = row[ContractHistory.contractId],
                    changeType = row[ContractHistory.changeType].name,
                    changedAt = row[ContractHistory.changedAt].toString(),
                    roomId = row[ContractHistory.roomId],
                    amount = row[ContractHistory.amount].toDouble(),
                    deposit = row[ContractHistory.deposit].toDouble(),
                    depositReturned = row[ContractHistory.depositReturned],
                    startDate = row[ContractHistory.startDate].toString(),
                    endDate = row[ContractHistory.endDate].toString(),
                    terminationDate = row[ContractHistory.terminationDate]?.toString(),
                    description = row[ContractHistory.description],
                    status = row[ContractHistory.status].name,
                    payedTillDayOfMonth = row[ContractHistory.payedTillDayOfMonth],
                )
            }
    }


    suspend fun getAllContractsWithRoomAndPersonDetails(): List<ContractDTO> = databaseProvider.dbQuery {
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
                    description = row[Contract.description],
                    expiringSoon = row[Contract.status] == ContractStatus.ACTIVE &&
                            !row[Contract.endDate].isAfter(LocalDate.now().plusMonths(2))
                )
            }
    }


    suspend fun deleteContract(details: DeleteContractDTO): ContractDeleteResult = databaseProvider.dbQuery {
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
                val message = "Błąd podczas aktualizacji płatności dla kontraktu ${details.contractId}"
                logger.info(message)
                return@dbQuery ContractDeleteResult.PaymentUpdateError(message)
            }

            val updatedContract = Contract.update({ Contract.id eq details.contractId }) {
                it[Contract.terminationDate] = details.terminationDate.toLocalDateWithFullPattern()
                it[Contract.status] = ContractStatus.TERMINATED
                it[Contract.depositReturned] = details.depositReturned
                it[Contract.description] = details.description
            }

            when (updatedContract) {
                1 -> {
                    recordContractHistory(details.contractId, ContractChangeType.TERMINATED)
                    ContractDeleteResult.Success(details.contractId)
                }
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