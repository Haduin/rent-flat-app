package pl.chodan.model.apartment.service

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.vendors.ForUpdateOption
import pl.chodan.database.Room
import pl.chodan.database.ExpenseCategory
import pl.chodan.model.contract.database.Contract
import pl.chodan.model.contract.database.ContractStatus
import pl.chodan.model.persons.dto.CreatedPersonDTO
import pl.chodan.model.persons.service.PersonService
import pl.chodan.testutil.connectWithoutRetries
import pl.chodan.testutil.assertApiError
import pl.chodan.testutil.runAgainstUncommittedCompetitor
import java.time.LocalDate
import pl.chodan.testutil.cleanTables
import pl.chodan.testutil.connectTestDatabase
import pl.chodan.testutil.insertApartment
import pl.chodan.testutil.insertRoom
import pl.chodan.model.expenses.dto.AddExpenseTemplateRequest
import pl.chodan.model.expenses.service.ExpenseTemplateService
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

    @Test
    fun `createApartment and createRoom are visible in the apartment list`() = runBlocking {
        val service = ApartmentService()

        val apartment = service.createApartment("Chmielna")
        val room = service.createRoom(apartment.id, "Pok 1")

        val result = service.getAllApartmentsWithRoomDetails().single()
        assertEquals("Chmielna", result.apartmentName)
        assertEquals(room?.id, result.rooms.single().roomId)
    }

    @Test
    fun `createRoom fails with APARTMENT_NOT_FOUND for an unknown apartment`() {
        assertApiError("APARTMENT_NOT_FOUND") { ApartmentService().createRoom(12345, "Pok 1") }
    }

    @Test
    fun `renameApartment and renameRoom update names and fail for missing rows`() = runBlocking {
        val service = ApartmentService()
        val apartmentId = database.insertApartment("Stara")
        val otherApartmentId = database.insertApartment("Inna")
        val roomId = database.insertRoom(apartmentId, "Pok 1")

        service.renameApartment(apartmentId, "Nowa")
        service.renameRoom(apartmentId, roomId, "Pok 2")
        assertApiError("APARTMENT_NOT_FOUND") { service.renameApartment(12345, "X") }
        // a room can only be renamed through its own apartment
        assertApiError("ROOM_NOT_FOUND") { service.renameRoom(otherApartmentId, roomId, "X") }

        val renamed = service.getAllApartmentsWithRoomDetails().single { it.apartmentId == apartmentId }
        assertEquals("Nowa", renamed.apartmentName)
        assertEquals("Pok 2", renamed.rooms.single().roomName)
    }

    @Test
    fun `deleteRoom removes an unused room and refuses one a cost template points at`() = runBlocking {
        val service = ApartmentService()
        val apartmentId = database.insertApartment("Chmielna")
        val freeRoom = database.insertRoom(apartmentId, "Pok 1")
        val usedRoom = database.insertRoom(apartmentId, "Pok 2")
        ExpenseTemplateService().createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = apartmentId, roomId = usedRoom, amount = 100.0,
                category = ExpenseCategory.OTHER, expenseDate = "10"
            )
        )

        service.deleteRoom(apartmentId, freeRoom)
        assertApiError("ROOM_IN_USE") { service.deleteRoom(apartmentId, usedRoom) }
        assertApiError("ROOM_NOT_FOUND") { service.deleteRoom(apartmentId, freeRoom) }
        assertEquals(listOf(usedRoom), service.getAllApartmentsWithRoomDetails().single().rooms.map { it.roomId })
    }

    @Test
    fun `deleteRoom waits for an uncommitted contract on the room and then refuses with ROOM_IN_USE (D14)`() = runBlocking {
        val apartmentId = database.insertApartment()
        val roomId = database.insertRoom(apartmentId)
        val personId = PersonService().createPerson(CreatedPersonDTO("Jan", "Kowalski", "ABC123", "PL"))
        // Exposed retries a transaction after an SQL error, which would turn the unfixed FK failure into ROOM_IN_USE on retry.
        stopTestKoin()
        startTestKoin(connectWithoutRetries())

        val result = runAgainstUncommittedCompetitor(
            database,
            competitor = {
                // same lock as lockRoom (internal to main, not visible from integrationTest)
                Room.selectAll().where { Room.id eq roomId }.forUpdate(ForUpdateOption.PostgreSQL.ForKeyShare).toList()
                Contract.insert {
                    it[Contract.personId] = personId
                    it[Contract.roomId] = roomId
                    it[amount] = 1500.toBigDecimal()
                    it[deposit] = 1500.toBigDecimal()
                    it[startDate] = LocalDate.of(2026, 1, 1)
                    it[endDate] = LocalDate.of(2026, 12, 31)
                    it[status] = ContractStatus.ACTIVE
                    it[payedTillDayOfMonth] = "10"
                }
            },
            service = { ApartmentService().deleteRoom(apartmentId, roomId) },
        )

        assertEquals("ROOM_IN_USE", (result.exceptionOrNull() as? ApartmentError)?.code?.name)
    }
}
