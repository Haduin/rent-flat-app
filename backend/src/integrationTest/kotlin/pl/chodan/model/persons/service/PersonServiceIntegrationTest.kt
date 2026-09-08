package pl.chodan.model.persons.service

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pl.chodan.model.contract.dto.NewContractDTO
import pl.chodan.model.contract.service.ContractService
import pl.chodan.model.persons.dto.CreatedPersonDTO
import pl.chodan.model.persons.dto.UpdatePersonDTO
import pl.chodan.testutil.cleanTables
import pl.chodan.testutil.connectTestDatabase
import pl.chodan.testutil.insertApartment
import pl.chodan.testutil.insertRoom
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin

class PersonServiceIntegrationTest {

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
    fun `createPerson always starts a person as NON_RESIDENT`() = runBlocking {
        val service = PersonService()

        val id = service.createPerson(
            CreatedPersonDTO(firstName = "Jan", lastName = "Kowalski", documentNumber = "ABC123", nationality = "PL")
        )

        val saved = service.getPersonById(id)
        assertEquals("NON_RESIDENT", saved?.status)
    }

    @Test
    fun `getPersonById returns null for an unknown id`() = runBlocking {
        val result = PersonService().getPersonById(999)

        assertNull(result)
    }

    @Test
    fun `getAllPersons returns every person regardless of status`() = runBlocking {
        val service = PersonService()
        service.createPerson(CreatedPersonDTO("Jan", "Kowalski", "ABC123", "PL"))
        service.createPerson(CreatedPersonDTO("Anna", "Nowak", "XYZ789", "PL"))

        val all = service.getAllPersons()

        assertEquals(2, all.size)
    }

    @Test
    fun `getNonResidentPersons only returns persons with NON_RESIDENT status`() = runBlocking {
        val service = PersonService()
        // PersonService has no "make resident" method of its own, and updatePerson silently
        // ignores the status field it's given (see the dedicated test below) - the only real
        // production path that flips a person to RESIDENT is ContractService.createContract.
        val residentId = service.createPerson(CreatedPersonDTO("Jan", "Kowalski", "ABC123", "PL"))
        service.createPerson(CreatedPersonDTO("Anna", "Nowak", "XYZ789", "PL"))
        val roomId = database.insertRoom(database.insertApartment())
        ContractService().createContract(
            NewContractDTO(
                personId = residentId, roomId = roomId,
                startDate = "2026-08-01", endDate = "2027-07-31",
                amount = 2000.0, deposit = 2000.0, payedDate = 10
            )
        )

        val nonResidents = service.getNonResidentPersons()

        assertEquals(1, nonResidents.size)
        assertEquals("Anna", nonResidents.single().firstName)
    }

    @Test
    fun `updatePerson overwrites the name, document number and nationality`() = runBlocking {
        val service = PersonService()
        val id = service.createPerson(CreatedPersonDTO("Jan", "Kowalski", "ABC123", "PL"))

        val updatedRows = service.updatePerson(
            UpdatePersonDTO(
                id = id, firstName = "Janusz", lastName = "Nowak",
                documentNumber = "NEW999", nationality = "DE", status = "RESIDENT"
            )
        )

        assertEquals(1, updatedRows)
        val saved = service.getPersonById(id)
        assertEquals("Janusz", saved?.firstName)
        assertEquals("Nowak", saved?.lastName)
        assertEquals("NEW999", saved?.documentNumber)
        assertEquals("DE", saved?.nationality)
    }

    // UpdatePersonDTO carries a `status` field, but PersonService.updatePerson never assigns it
    // to the `status` column - a request that only intends to change status silently no-ops.
    @Test
    fun `updatePerson silently ignores the requested status change`() = runBlocking {
        val service = PersonService()
        val id = service.createPerson(CreatedPersonDTO("Jan", "Kowalski", "ABC123", "PL"))

        service.updatePerson(
            UpdatePersonDTO(
                id = id, firstName = "Jan", lastName = "Kowalski",
                documentNumber = "ABC123", nationality = "PL", status = "RESIDENT"
            )
        )

        assertEquals("NON_RESIDENT", service.getPersonById(id)?.status)
    }

    @Test
    fun `updatePerson affects zero rows for an unknown id`() = runBlocking {
        val updatedRows = PersonService().updatePerson(
            UpdatePersonDTO(
                id = 999, firstName = "Ghost", lastName = "Person",
                documentNumber = "NONE", nationality = "PL", status = "RESIDENT"
            )
        )

        assertEquals(0, updatedRows)
    }

    @Test
    fun `deletePerson removes the row`() = runBlocking {
        val service = PersonService()
        val id = service.createPerson(CreatedPersonDTO("Jan", "Kowalski", "ABC123", "PL"))

        val deletedRows = service.deletePerson(id)

        assertEquals(1, deletedRows)
        assertNull(service.getPersonById(id))
        assertTrue(service.getAllPersons().isEmpty())
    }

    @Test
    fun `deletePerson affects zero rows for an unknown id`() = runBlocking {
        val deletedRows = PersonService().deletePerson(999)

        assertEquals(0, deletedRows)
    }
}
