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
import pl.chodan.model.perons.dto.CreatedPersonDTO
import pl.chodan.model.perons.service.PersonService
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
