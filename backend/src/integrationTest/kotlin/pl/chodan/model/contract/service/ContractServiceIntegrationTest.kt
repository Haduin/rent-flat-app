package pl.chodan.model.contract.service

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pl.chodan.database.PaymentStatus
import pl.chodan.model.contract.dto.DeleteContractDTO
import pl.chodan.model.contract.dto.NewContractDTO
import pl.chodan.model.contract.dto.UpdateContractDetails
import pl.chodan.model.payments.service.PaymentService
import pl.chodan.model.persons.dto.CreatedPersonDTO
import pl.chodan.model.persons.service.PersonService
import pl.chodan.testutil.cleanTables
import pl.chodan.testutil.connectTestDatabase
import pl.chodan.testutil.insertApartment
import pl.chodan.testutil.insertPayment
import pl.chodan.testutil.insertRoom
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.assertApiError

class ContractServiceIntegrationTest {

    private val database = connectTestDatabase()

    @BeforeEach
    fun setUp() {
        database.cleanTables()
        startTestKoin(database)
    }

    @AfterEach
    fun tearDown() {
        stopTestKoin()
    }

    private suspend fun createTenant(): Int =
        PersonService().createPerson(CreatedPersonDTO("Jan", "Kowalski", "ABC123", "PL"))

    private fun createRoom(): Int = database.insertRoom(database.insertApartment())

    @Test
    fun `createContract marks the tenant as RESIDENT`() = runBlocking {
        val personId = createTenant()
        val roomId = createRoom()

        ContractService().createContract(
            NewContractDTO(
                personId = personId, roomId = roomId,
                startDate = "2026-08-01", endDate = "2027-07-31",
                amount = 2000.0, deposit = 2000.0, payedDate = 10
            )
        )

        val person = PersonService().getPersonById(personId)
        assertEquals("RESIDENT", person?.status)
    }

    @Test
    fun `deleteContract makes the tenant NON_RESIDENT once their last active contract ends`() = runBlocking {
        val personId = createTenant()
        val contractService = ContractService()
        val contractIds = List(2) {
            contractService.createContract(
                NewContractDTO(
                    personId = personId, roomId = createRoom(),
                    startDate = "2026-01-01", endDate = "2026-12-31",
                    amount = 2000.0, deposit = 500.0, payedDate = 10
                )
            )
        }
        val terminate = { contractId: Int ->
            DeleteContractDTO(
                contractId = contractId, terminationDate = "2026-08-15",
                depositReturned = null, positiveCancel = null, description = null
            )
        }

        contractService.deleteContract(terminate(contractIds[0]))
        assertEquals("RESIDENT", PersonService().getPersonById(personId)?.status)

        contractService.deleteContract(terminate(contractIds[1]))
        assertEquals("NON_RESIDENT", PersonService().getPersonById(personId)?.status)
    }

    @Test
    fun `updateContract only overwrites the provided fields`() = runBlocking {
        val personId = createTenant()
        val roomId = createRoom()
        val contractService = ContractService()
        val id = contractService.createContract(
            NewContractDTO(
                personId = personId, roomId = roomId,
                startDate = "2026-08-01", endDate = "2027-07-31",
                amount = 2000.0, deposit = 500.0, payedDate = 10
            )
        )

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = 2500.0, deposit = null,
                startDate = null, endDate = null, payedTillDayOfMonth = null
            )
        )

        val updated = contractService.contractById(id)
        assertEquals(0, updated.amount!!.compareTo(2500.0))
        assertEquals(0, updated.deposit!!.compareTo(500.0))
        assertEquals("2026-08-01", updated.startDate)
    }

    @Test
    fun `updateContract rejects edits on a terminated contract`() = runBlocking {
        val personId = createTenant()
        val roomId = createRoom()
        val contractService = ContractService()
        val id = contractService.createContract(
            NewContractDTO(
                personId = personId, roomId = roomId,
                startDate = "2026-08-01", endDate = "2027-07-31",
                amount = 2000.0, deposit = 500.0, payedDate = 10
            )
        )
        contractService.deleteContract(
            DeleteContractDTO(
                contractId = id, terminationDate = "2026-08-15",
                depositReturned = null, positiveCancel = null, description = null
            )
        )

        assertApiError("CONTRACT_TERMINATED") {
            contractService.updateContract(
                UpdateContractDetails(
                    contractId = id, roomId = null, amount = 9999.0, deposit = null,
                    startDate = null, endDate = null, payedTillDayOfMonth = null
                )
            )
        }

        val untouched = contractService.contractById(id)
        assertEquals(0, untouched.amount!!.compareTo(2000.0))
    }

    private suspend fun ContractService.contractById(id: Int) =
        getAllContractsWithRoomAndPersonDetails().single { it.id == id }

    /**
     * Baseline contract used by the per-field update tests below, plus an "everything else stayed
     * put" assertion so each test both proves its one field changed and that updateContract's
     * per-field `?.let` guards didn't leak into the untouched columns.
     */
    private suspend fun createBaselineContract(contractService: ContractService, roomId: Int): Int =
        contractService.createContract(
            NewContractDTO(
                personId = createTenant(), roomId = roomId,
                startDate = "2026-08-01", endDate = "2027-07-31",
                amount = 2000.0, deposit = 500.0, payedDate = 10
            )
        )

    @Test
    fun `updateContract changes roomId and leaves other fields untouched`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val newRoomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = newRoomId, amount = null, deposit = null,
                startDate = null, endDate = null, payedTillDayOfMonth = null
            )
        )

        val updated = contractService.contractById(id)
        assertEquals(newRoomId, updated.room?.id)
        assertEquals(0, updated.amount!!.compareTo(2000.0))
        assertEquals(0, updated.deposit!!.compareTo(500.0))
        assertEquals("2026-08-01", updated.startDate)
        assertEquals("2027-07-31", updated.endDate)
    }

    @Test
    fun `updateContract changes amount and leaves other fields untouched`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = 2750.0, deposit = null,
                startDate = null, endDate = null, payedTillDayOfMonth = null
            )
        )

        val updated = contractService.contractById(id)
        assertEquals(0, updated.amount!!.compareTo(2750.0))
        assertEquals(roomId, updated.room?.id)
        assertEquals(0, updated.deposit!!.compareTo(500.0))
        assertEquals("2026-08-01", updated.startDate)
        assertEquals("2027-07-31", updated.endDate)
    }

    @Test
    fun `updateContract changes deposit and leaves other fields untouched`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = null, deposit = 900.0,
                startDate = null, endDate = null, payedTillDayOfMonth = null
            )
        )

        val updated = contractService.contractById(id)
        assertEquals(0, updated.deposit!!.compareTo(900.0))
        assertEquals(roomId, updated.room?.id)
        assertEquals(0, updated.amount!!.compareTo(2000.0))
        assertEquals("2026-08-01", updated.startDate)
        assertEquals("2027-07-31", updated.endDate)
    }

    @Test
    fun `updateContract changes startDate and leaves other fields untouched`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = null, deposit = null,
                startDate = "2026-09-15", endDate = null, payedTillDayOfMonth = null
            )
        )

        val updated = contractService.contractById(id)
        assertEquals("2026-09-15", updated.startDate)
        assertEquals(roomId, updated.room?.id)
        assertEquals(0, updated.amount!!.compareTo(2000.0))
        assertEquals(0, updated.deposit!!.compareTo(500.0))
        assertEquals("2027-07-31", updated.endDate)
    }

    @Test
    fun `updateContract changes endDate and leaves other fields untouched`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = null, deposit = null,
                startDate = null, endDate = "2028-01-31", payedTillDayOfMonth = null
            )
        )

        val updated = contractService.contractById(id)
        assertEquals("2028-01-31", updated.endDate)
        assertEquals(roomId, updated.room?.id)
        assertEquals(0, updated.amount!!.compareTo(2000.0))
        assertEquals(0, updated.deposit!!.compareTo(500.0))
        assertEquals("2026-08-01", updated.startDate)
    }

    @Test
    fun `updateContract changes payedTillDayOfMonth and leaves other fields untouched`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = null, deposit = null,
                startDate = null, endDate = null, payedTillDayOfMonth = "25"
            )
        )

        val updated = contractService.getAllContractsWithRoomAndPersonDetails().single { it.id == id }
        assertEquals("25", updated.payedTillDayOfMonth)
        assertEquals(0, updated.amount!!.compareTo(2000.0))
        assertEquals(0, updated.deposit!!.compareTo(500.0))
        assertEquals("2026-08-01", updated.startDate)
        assertEquals("2027-07-31", updated.endDate)
    }

    @Test
    fun `createContract records a CREATED history entry snapshotting the initial values`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()

        val id = createBaselineContract(contractService, roomId)

        val history = contractService.getContractHistory(id)
        val createdEntry = history.single()
        assertEquals("CREATED", createdEntry.changeType)
        assertEquals(roomId, createdEntry.roomId)
        assertEquals(0, createdEntry.amount.compareTo(2000.0))
        assertEquals(0, createdEntry.deposit.compareTo(500.0))
        assertEquals("2026-08-01", createdEntry.startDate)
        assertEquals("2027-07-31", createdEntry.endDate)
        assertEquals("ACTIVE", createdEntry.status)
    }

    @Test
    fun `updateContract records history with the new roomId`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val newRoomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = newRoomId, amount = null, deposit = null,
                startDate = null, endDate = null, payedTillDayOfMonth = null
            )
        )

        val updateEntry = contractService.getContractHistory(id).single { it.changeType == "UPDATED" }
        assertEquals(newRoomId, updateEntry.roomId)
        assertEquals(0, updateEntry.amount.compareTo(2000.0))
        assertEquals(0, updateEntry.deposit.compareTo(500.0))
        assertEquals("2026-08-01", updateEntry.startDate)
        assertEquals("2027-07-31", updateEntry.endDate)
    }

    @Test
    fun `updateContract records history with the new amount`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = 3100.0, deposit = null,
                startDate = null, endDate = null, payedTillDayOfMonth = null
            )
        )

        val updateEntry = contractService.getContractHistory(id).single { it.changeType == "UPDATED" }
        assertEquals(0, updateEntry.amount.compareTo(3100.0))
        assertEquals(roomId, updateEntry.roomId)
        assertEquals(0, updateEntry.deposit.compareTo(500.0))
    }

    @Test
    fun `updateContract records history with the new deposit`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = null, deposit = 900.0,
                startDate = null, endDate = null, payedTillDayOfMonth = null
            )
        )

        val updateEntry = contractService.getContractHistory(id).single { it.changeType == "UPDATED" }
        assertEquals(0, updateEntry.deposit.compareTo(900.0))
        assertEquals(0, updateEntry.amount.compareTo(2000.0))
    }

    @Test
    fun `updateContract records history with the new startDate`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = null, deposit = null,
                startDate = "2026-09-15", endDate = null, payedTillDayOfMonth = null
            )
        )

        val updateEntry = contractService.getContractHistory(id).single { it.changeType == "UPDATED" }
        assertEquals("2026-09-15", updateEntry.startDate)
        assertEquals("2027-07-31", updateEntry.endDate)
    }

    @Test
    fun `updateContract records history with the new endDate`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = null, deposit = null,
                startDate = null, endDate = "2028-01-31", payedTillDayOfMonth = null
            )
        )

        val updateEntry = contractService.getContractHistory(id).single { it.changeType == "UPDATED" }
        assertEquals("2028-01-31", updateEntry.endDate)
        assertEquals("2026-08-01", updateEntry.startDate)
    }

    @Test
    fun `updateContract records history with the new payedTillDayOfMonth`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = null, deposit = null,
                startDate = null, endDate = null, payedTillDayOfMonth = "25"
            )
        )

        val updateEntry = contractService.getContractHistory(id).single { it.changeType == "UPDATED" }
        assertEquals("25", updateEntry.payedTillDayOfMonth)
    }

    @Test
    fun `updateContract appends one history entry per update, ordered oldest first`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        val id = createBaselineContract(contractService, roomId)

        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = 2500.0, deposit = null,
                startDate = null, endDate = null, payedTillDayOfMonth = null
            )
        )
        contractService.updateContract(
            UpdateContractDetails(
                contractId = id, roomId = null, amount = 3000.0, deposit = null,
                startDate = null, endDate = null, payedTillDayOfMonth = null
            )
        )

        val history = contractService.getContractHistory(id)
        assertEquals(3, history.size)
        assertEquals("CREATED", history[0].changeType)
        assertEquals("UPDATED", history[1].changeType)
        assertEquals("UPDATED", history[2].changeType)
        assertEquals(0, history[1].amount.compareTo(2500.0))
        assertEquals(0, history[2].amount.compareTo(3000.0))
    }

    @Test
    fun `getAllContractsWithRoomAndPersonDetails maps the joined person and room`() = runBlocking {
        val personId = createTenant()
        val apartmentId = database.insertApartment("Mieszkanie A")
        val roomId = database.insertRoom(apartmentId, "Pokój 1")
        ContractService().createContract(
            NewContractDTO(
                personId = personId, roomId = roomId,
                startDate = "2026-08-01", endDate = "2027-07-31",
                amount = 2000.0, deposit = 500.0, payedDate = 10
            )
        )

        val contracts = ContractService().getAllContractsWithRoomAndPersonDetails()

        assertEquals(1, contracts.size)
        val contract = contracts.single()
        assertEquals("Jan", contract.person?.firstName)
        assertEquals("Pokój 1", contract.room?.number)
        assertEquals("Mieszkanie A", contract.room?.apartment)
        assertEquals("ACTIVE", contract.status)
    }

    @Test
    fun `deleteContract terminates the contract and cancels its pending payments`() = runBlocking {
        val personId = createTenant()
        val roomId = createRoom()
        val contractService = ContractService()
        val id = contractService.createContract(
            NewContractDTO(
                personId = personId, roomId = roomId,
                startDate = "2026-08-01", endDate = "2027-07-31",
                amount = 2000.0, deposit = 500.0, payedDate = 10
            )
        )
        database.insertPayment(id, scopeDate = "2026-08", status = PaymentStatus.PENDING)
        database.insertPayment(id, scopeDate = "2026-09", status = PaymentStatus.PENDING)
        val alreadyPaidId = database.insertPayment(id, scopeDate = "2026-07", status = PaymentStatus.PAID)
        val unpaidBeforeId = database.insertPayment(id, scopeDate = "2026-06", status = PaymentStatus.LATE)

        contractService.deleteContract(
            DeleteContractDTO(
                contractId = id, terminationDate = "2026-08-15",
                depositReturned = true, positiveCancel = true, description = "Zakończono wcześniej"
            )
        )

        val payments = PaymentService().getAllPayments()
        val pendingCancelled = payments.filter { it.id != alreadyPaidId && it.id != unpaidBeforeId }
        assertTrue(pendingCancelled.all { it.status == PaymentStatus.CANCELLED })
        assertEquals(PaymentStatus.PAID, payments.single { it.id == alreadyPaidId }.status)
        // rent owed for a month before the termination month stays owed
        assertEquals(PaymentStatus.LATE, payments.single { it.id == unpaidBeforeId }.status)
    }

    @Test
    fun `createContract rejects a room with an overlapping active contract`() = runBlocking {
        val contractService = ContractService()
        val roomId = createRoom()
        createBaselineContract(contractService, roomId) // 2026-08-01 .. 2027-07-31

        assertApiError("ROOM_OCCUPIED") { createBaselineContract(contractService, roomId) }
        val afterIt = contractService.createContract(
            NewContractDTO(
                personId = createTenant(), roomId = roomId, startDate = "2027-08-01", endDate = "2028-07-31",
                amount = 2000.0, deposit = 500.0, payedDate = 10
            )
        )
        assertTrue(afterIt > 0)
    }

    @Test
    fun `updateContract rejects moving to an occupied room but allows changing its own dates`() = runBlocking {
        val contractService = ContractService()
        val occupiedRoom = createRoom()
        createBaselineContract(contractService, occupiedRoom)
        val id = createBaselineContract(contractService, createRoom())

        assertApiError("ROOM_OCCUPIED") {
            contractService.updateContract(UpdateContractDetails(id, occupiedRoom, null, null, null, null, null))
        }
        contractService.updateContract(UpdateContractDetails(id, null, null, null, null, "2027-12-31", null))
        assertEquals("2027-12-31", contractService.contractById(id).endDate)
    }

    @Test
    fun `updateContract rejects an end date before the stored start date`() = runBlocking {
        val contractService = ContractService()
        val id = createBaselineContract(contractService, createRoom()) // starts 2026-08-01

        assertApiError("VALIDATION_FAILED") {
            contractService.updateContract(UpdateContractDetails(id, null, null, null, null, "2026-07-31", null))
        }
    }

    @Test
    fun `deleteContract rejects an unknown contract with CONTRACT_NOT_FOUND`() {
        assertApiError("CONTRACT_NOT_FOUND") {
            ContractService().deleteContract(
                DeleteContractDTO(
                    contractId = 999, terminationDate = "2026-08-15",
                    depositReturned = null, positiveCancel = null, description = null
                )
            )
        }
    }

    @Test
    fun `deleteContract rejects an already terminated contract with CONTRACT_TERMINATED`() = runBlocking {
        val contractService = ContractService()
        val id = contractService.createContract(
            NewContractDTO(
                personId = createTenant(), roomId = createRoom(),
                startDate = "2026-08-01", endDate = "2027-07-31",
                amount = 2000.0, deposit = 500.0, payedDate = 10
            )
        )
        val details = DeleteContractDTO(
            contractId = id, terminationDate = "2026-08-15",
            depositReturned = null, positiveCancel = null, description = null
        )
        contractService.deleteContract(details)

        assertApiError("CONTRACT_TERMINATED") { contractService.deleteContract(details) }
    }

    @Test
    fun `updateContract rejects an unknown contract with CONTRACT_NOT_FOUND`() {
        assertApiError("CONTRACT_NOT_FOUND") {
            ContractService().updateContract(UpdateContractDetails(
                    contractId = 999, roomId = null, amount = 1500.0, deposit = null,
                    startDate = null, endDate = null, payedTillDayOfMonth = null
                ))
        }
    }

    @Test
    fun `createContract rejects an unknown person with PERSON_NOT_FOUND`() {
        val roomId = createRoom()
        assertApiError("PERSON_NOT_FOUND") {
            ContractService().createContract(
                NewContractDTO(
                    personId = 999, roomId = roomId,
                    startDate = "2026-08-01", endDate = "2027-07-31",
                    amount = 2000.0, deposit = 2000.0, payedDate = 10
                )
            )
        }
    }

    @Test
    fun `createContract rejects an unknown room with ROOM_NOT_FOUND`() = runBlocking {
        val personId = createTenant()
        assertApiError("ROOM_NOT_FOUND") {
            ContractService().createContract(
                NewContractDTO(
                    personId = personId, roomId = 999,
                    startDate = "2026-08-01", endDate = "2027-07-31",
                    amount = 2000.0, deposit = 2000.0, payedDate = 10
                )
            )
        }
    }

    @Test
    fun `updateContract rejects an unknown room with ROOM_NOT_FOUND`() = runBlocking {
        val contractService = ContractService()
        val id = createBaselineContract(contractService, createRoom())

        assertApiError("ROOM_NOT_FOUND") {
            contractService.updateContract(
                UpdateContractDetails(
                    contractId = id, roomId = 999, amount = null, deposit = null,
                    startDate = null, endDate = null, payedTillDayOfMonth = null
                )
            )
        }
    }

    @Test
    fun `getContractHistory rejects an unknown contract with CONTRACT_NOT_FOUND`() {
        assertApiError("CONTRACT_NOT_FOUND") { ContractService().getContractHistory(999) }
    }

    @Test
    fun `createContract checks the person before the room`() {
        assertApiError("PERSON_NOT_FOUND") {
            ContractService().createContract(
                NewContractDTO(
                    personId = 999, roomId = 999,
                    startDate = "2026-08-01", endDate = "2027-07-31",
                    amount = 2000.0, deposit = 2000.0, payedDate = 10
                )
            )
        }
    }

    @Test
    fun `updateContract checks the contract before the new room`() = runBlocking {
        val contractService = ContractService()
        val id = createBaselineContract(contractService, createRoom())
        contractService.deleteContract(
            DeleteContractDTO(
                contractId = id, terminationDate = "2026-08-15",
                depositReturned = null, positiveCancel = null, description = null
            )
        )

        assertApiError("CONTRACT_TERMINATED") {
            contractService.updateContract(
                UpdateContractDetails(
                    contractId = id, roomId = 999, amount = null, deposit = null,
                    startDate = null, endDate = null, payedTillDayOfMonth = null
                )
            )
        }
    }
}
