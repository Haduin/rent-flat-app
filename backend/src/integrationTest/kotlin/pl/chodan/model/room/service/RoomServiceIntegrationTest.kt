package pl.chodan.model.room.service

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pl.chodan.model.contract.dto.DeleteContractDTO
import pl.chodan.model.contract.dto.NewContractDTO
import pl.chodan.model.contract.service.ContractService
import pl.chodan.model.persons.dto.CreatedPersonDTO
import pl.chodan.model.persons.service.PersonService
import pl.chodan.testutil.cleanTables
import pl.chodan.testutil.connectTestDatabase
import pl.chodan.testutil.insertApartment
import pl.chodan.testutil.insertRoom
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin

class RoomServiceIntegrationTest {

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

    @Test
    fun `getRoomsWithAparts returns rooms joined with their apartment name`() = runBlocking {
        val apartmentId = database.insertApartment("Mieszkanie A")
        database.insertRoom(apartmentId, "Pokój 1")

        val rooms = RoomService().getRoomsWithAparts()

        assertEquals(1, rooms.size)
        assertEquals("Mieszkanie A", rooms.single().apartment)
        assertEquals("Pokój 1", rooms.single().number)
    }

    @Test
    fun `fetchFreeRoomsBetweenDates includes a room with no contracts`() = runBlocking {
        val apartmentId = database.insertApartment()
        database.insertRoom(apartmentId, "Wolny pokój")

        val freeRooms = RoomService().fetchFreeRoomsBetweenDates("2026-08-01", "2026-08-31")

        assertEquals(1, freeRooms.size)
    }

    @Test
    fun `fetchFreeRoomsBetweenDates excludes a room with an overlapping active contract`() = runBlocking {
        val apartmentId = database.insertApartment()
        val roomId = database.insertRoom(apartmentId, "Zajęty pokój")
        val personId = createTenant()
        ContractService().createContract(
            NewContractDTO(
                personId = personId, roomId = roomId,
                startDate = "2026-08-01", endDate = "2026-08-31",
                amount = 2000.0, deposit = 2000.0, payedDate = 10
            )
        )

        val freeRooms = RoomService().fetchFreeRoomsBetweenDates("2026-08-10", "2026-08-20")

        assertTrue(freeRooms.isEmpty())
    }

    @Test
    fun `fetchFreeRoomsBetweenDates includes a room whose contract does not overlap the range`() = runBlocking {
        val apartmentId = database.insertApartment()
        val roomId = database.insertRoom(apartmentId, "Pokój")
        val personId = createTenant()
        ContractService().createContract(
            NewContractDTO(
                personId = personId, roomId = roomId,
                startDate = "2026-01-01", endDate = "2026-01-31",
                amount = 2000.0, deposit = 2000.0, payedDate = 10
            )
        )

        val freeRooms = RoomService().fetchFreeRoomsBetweenDates("2026-08-01", "2026-08-31")

        assertEquals(1, freeRooms.size)
    }

    @Test
    fun `fetchFreeRoomsBetweenDates includes a room whose overlapping contract was terminated`() = runBlocking {
        val apartmentId = database.insertApartment()
        val roomId = database.insertRoom(apartmentId, "Pokój")
        val personId = createTenant()
        val contractService = ContractService()
        val contractId = contractService.createContract(
            NewContractDTO(
                personId = personId, roomId = roomId,
                startDate = "2026-08-01", endDate = "2026-08-31",
                amount = 2000.0, deposit = 2000.0, payedDate = 10
            )
        )
        contractService.deleteContract(
            DeleteContractDTO(
                contractId = contractId, terminationDate = "2026-08-15",
                depositReturned = true, positiveCancel = true, description = null
            )
        )

        val freeRooms = RoomService().fetchFreeRoomsBetweenDates("2026-08-10", "2026-08-20")

        assertEquals(1, freeRooms.size)
    }
}
