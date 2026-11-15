package pl.chodan.model.contract.service

import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.Payment
import pl.chodan.database.PaymentStatus
import pl.chodan.database.Person
import pl.chodan.database.PersonStatus
import pl.chodan.database.Room
import pl.chodan.model.apartment.database.Apartment
import pl.chodan.model.apartment.service.lockRoom
import pl.chodan.model.contract.database.Contract
import pl.chodan.model.contract.database.ContractChangeType
import pl.chodan.model.contract.database.ContractHistory
import pl.chodan.model.contract.database.ContractStatus
import pl.chodan.model.contract.dto.ContractDTO
import pl.chodan.model.contract.dto.ContractHistoryDTO
import pl.chodan.model.contract.dto.DeleteContractDTO
import pl.chodan.model.contract.dto.NewContractDTO
import pl.chodan.model.contract.dto.UpdateContractDetails
import pl.chodan.model.persons.dto.PersonDTO
import pl.chodan.model.persons.service.lockPerson
import pl.chodan.model.room.dto.RoomWithApartmentDTO
import pl.chodan.toLocalDateWithFullPattern
import java.time.LocalDate
import java.time.LocalDateTime

class ContractService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()

    suspend fun createContract(newContractDTO: NewContractDTO): Int = databaseProvider.dbQuery {
        // Lock order person -> room, same in every writer, so concurrent deletes cannot slip past the checks.
        lockPerson(newContractDTO.personId)
        lockRoom(newContractDTO.roomId)
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

    suspend fun updateContract(contractDetails: UpdateContractDetails) = databaseProvider.dbQuery {
        lockActiveContract(contractDetails.contractId)
        contractDetails.roomId?.let { lockRoom(it) }

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

    /** Locks the contract row for the rest of the transaction; rejects unknown and terminated contracts. */
    private fun lockActiveContract(contractId: Int): ResultRow {
        val contract = Contract.selectAll().where { Contract.id eq contractId }.forUpdate().singleOrNull()
            ?: throw ContractError.NotFound(contractId)
        if (ContractStatus.TERMINATED == contract[Contract.status]) throw ContractError.Terminated()
        return contract
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

    /** A tenant whose last active contract ended can be picked for a new one again (see getNonResidentPersons). */
    private fun releasePersonWithoutActiveContract(personId: Int) {
        val hasActiveContract = Contract.selectAll()
            .where { (Contract.personId eq personId) and (Contract.status eq ContractStatus.ACTIVE) }
            .any()
        if (!hasActiveContract) {
            Person.update({ Person.id eq personId }) { it[status] = PersonStatus.NON_RESIDENT }
        }
    }

    suspend fun getContractHistory(contractId: Int): List<ContractHistoryDTO> = databaseProvider.dbQuery {
        if (Contract.selectAll().where { Contract.id eq contractId }.empty()) throw ContractError.NotFound(contractId)
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
                val isActive = ContractStatus.ACTIVE == row[Contract.status]
                val endDate = row[Contract.endDate]
                val today = LocalDate.now()
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
                    endDate = endDate.toString(),
                    amount = row[Contract.amount].toDouble(),
                    deposit = row[Contract.deposit].toDouble(),
                    status = row[Contract.status].name,
                    terminationDate = row[Contract.terminationDate]?.toString(),
                    payedTillDayOfMonth = row[Contract.payedTillDayOfMonth],
                    depositReturned = row[Contract.depositReturned],
                    description = row[Contract.description],
                    expiringSoon = isActive && !endDate.isBefore(today) && !endDate.isAfter(today.plusMonths(2)),
                    alreadyExpired = isActive && endDate.isBefore(today)
                )
            }
    }


    suspend fun deleteContract(details: DeleteContractDTO) = databaseProvider.dbQuery {
        val contract = lockActiveContract(details.contractId)

        Payment.update({
            (Payment.contractId eq details.contractId) and
                    (Payment.status eq PaymentStatus.PENDING)
        }) {
            it[status] = PaymentStatus.CANCELLED
            it[payedDate] = details.terminationDate.toLocalDateWithFullPattern()
        }

        Contract.update({ Contract.id eq details.contractId }) {
            it[Contract.terminationDate] = details.terminationDate.toLocalDateWithFullPattern()
            it[Contract.status] = ContractStatus.TERMINATED
            it[Contract.depositReturned] = details.depositReturned
            it[Contract.description] = details.description
        }

        recordContractHistory(details.contractId, ContractChangeType.TERMINATED)
        releasePersonWithoutActiveContract(contract[Contract.personId])
    }
}
