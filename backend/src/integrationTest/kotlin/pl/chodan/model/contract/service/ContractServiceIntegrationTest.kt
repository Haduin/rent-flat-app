package pl.chodan.model.contract.service

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertThrows
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
    fun `getContractById returns the created contract`() = runBlocking {
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

        val contract = contractService.getContractById(id)

        assertEquals(personId, contract?.personId)
        assertEquals(roomId, contract?.roomId)
        assertEquals("2026-08-01", contract?.startDate)
    }

    @Test
    fun `getContractById returns null for an unknown id`() = runBlocking {
        val contract = ContractService().getContractById(999)

        assertNull(contract)
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

        val updated = contractService.getContractById(id)
        assertEquals(0, updated!!.amount!!.compareTo(2500.0.toBigDecimal()))
        assertEquals(0, updated.deposit!!.compareTo(500.0.toBigDecimal()))
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

        assertThrows(IllegalStateException::class.java) {
            runBlocking {
                contractService.updateContract(
                    UpdateContractDetails(
                        contractId = id, roomId = null, amount = 9999.0, deposit = null,
                        startDate = null, endDate = null, payedTillDayOfMonth = null
                    )
                )
            }
        }

        val untouched = contractService.getContractById(id)
        assertEquals(0, untouched!!.amount!!.compareTo(2000.0.toBigDecimal()))
    }

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

        val updated = contractService.getContractById(id)!!
        assertEquals(newRoomId, updated.roomId)
        assertEquals(0, updated.amount!!.compareTo(2000.0.toBigDecimal()))
        assertEquals(0, updated.deposit!!.compareTo(500.0.toBigDecimal()))
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

        val updated = contractService.getContractById(id)!!
        assertEquals(0, updated.amount!!.compareTo(2750.0.toBigDecimal()))
        assertEquals(roomId, updated.roomId)
        assertEquals(0, updated.deposit!!.compareTo(500.0.toBigDecimal()))
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

        val updated = contractService.getContractById(id)!!
        assertEquals(0, updated.deposit!!.compareTo(900.0.toBigDecimal()))
        assertEquals(roomId, updated.roomId)
        assertEquals(0, updated.amount!!.compareTo(2000.0.toBigDecimal()))
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

        val updated = contractService.getContractById(id)!!
        assertEquals("2026-09-15", updated.startDate)
        assertEquals(roomId, updated.roomId)
        assertEquals(0, updated.amount!!.compareTo(2000.0.toBigDecimal()))
        assertEquals(0, updated.deposit!!.compareTo(500.0.toBigDecimal()))
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

        val updated = contractService.getContractById(id)!!
        assertEquals("2028-01-31", updated.endDate)
        assertEquals(roomId, updated.roomId)
        assertEquals(0, updated.amount!!.compareTo(2000.0.toBigDecimal()))
        assertEquals(0, updated.deposit!!.compareTo(500.0.toBigDecimal()))
        assertEquals("2026-08-01", updated.startDate)
    }

    // getContractById doesn't select payedTillDayOfMonth, so this field can only be observed
    // through the join-backed getAllContractsWithRoomAndPersonDetails.
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

        val result = contractService.deleteContract(
            DeleteContractDTO(
                contractId = id, terminationDate = "2026-08-15",
                depositReturned = true, positiveCancel = true, description = "Zakończono wcześniej"
            )
        )

        assertTrue(result is ContractDeleteResult.Success)
        val payments = PaymentService().getAllPayments()
        val pendingCancelled = payments.filter { it.id != alreadyPaidId }
        assertTrue(pendingCancelled.all { it.status == PaymentStatus.CANCELLED })
        assertEquals(PaymentStatus.PAID, payments.single { it.id == alreadyPaidId }.status)
    }

    @Test
    fun `deleteContract returns NotFound for an unknown contract`() = runBlocking {
        val result = ContractService().deleteContract(
            DeleteContractDTO(
                contractId = 999, terminationDate = "2026-08-15",
                depositReturned = null, positiveCancel = null, description = null
            )
        )

        assertTrue(result is ContractDeleteResult.NotFound)
    }
}
