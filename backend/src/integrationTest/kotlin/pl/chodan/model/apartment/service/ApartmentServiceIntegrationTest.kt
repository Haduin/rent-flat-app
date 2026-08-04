package pl.chodan.model.apartment.service

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pl.chodan.testutil.cleanTables
import pl.chodan.testutil.connectTestDatabase
import pl.chodan.testutil.insertApartment
import pl.chodan.testutil.insertRoom
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin

class ApartmentServiceIntegrationTest {

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

    @Test
    fun `getAllApartmentsWithRoomDetails groups rooms under their apartment`() = runBlocking {
        val apartmentId = database.insertApartment("Mieszkanie A")
        database.insertRoom(apartmentId, "Pokój 1")
        database.insertRoom(apartmentId, "Pokój 2")

        val result = ApartmentService().getAllApartmentsWithRoomDetails()

        assertEquals(1, result.size)
        val apartment = result.single()
        assertEquals(apartmentId, apartment.apartmentId)
        assertEquals("Mieszkanie A", apartment.apartmentName)
        assertEquals(2, apartment.rooms.size)
        assertTrue(apartment.rooms.all { it.apartmentId == apartmentId })
    }

    @Test
    fun `getAllApartmentsWithRoomDetails returns an empty room list for an apartment without rooms`() = runBlocking {
        val apartmentId = database.insertApartment("Mieszkanie bez pokoi")

        val result = ApartmentService().getAllApartmentsWithRoomDetails()

        assertEquals(1, result.size)
        assertEquals(apartmentId, result.single().apartmentId)
        assertTrue(result.single().rooms.isEmpty())
    }

    @Test
    fun `getAllApartmentsWithRoomDetails keeps multiple apartments separate`() = runBlocking {
        val apartmentA = database.insertApartment("Mieszkanie A")
        val apartmentB = database.insertApartment("Mieszkanie B")
        database.insertRoom(apartmentA, "A1")
        database.insertRoom(apartmentB, "B1")
        database.insertRoom(apartmentB, "B2")

        val result = ApartmentService().getAllApartmentsWithRoomDetails()

        assertEquals(2, result.size)
        assertEquals(1, result.single { it.apartmentId == apartmentA }.rooms.size)
        assertEquals(2, result.single { it.apartmentId == apartmentB }.rooms.size)
    }
}
