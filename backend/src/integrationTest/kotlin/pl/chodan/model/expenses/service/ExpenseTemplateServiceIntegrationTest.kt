package pl.chodan.model.expenses.service

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pl.chodan.database.ExpenseCategory
import pl.chodan.model.expenses.dto.AddExpenseTemplateRequest
import pl.chodan.model.expenses.dto.UpdateExpenseTemplate
import pl.chodan.testutil.assertApiError
import pl.chodan.testutil.cleanTables
import pl.chodan.testutil.connectTestDatabase
import pl.chodan.testutil.deactivateExpenseTemplate
import pl.chodan.testutil.insertApartment
import pl.chodan.testutil.insertRoom
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin

class ExpenseTemplateServiceIntegrationTest {

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
    fun `createExpenseTemplate then findAll returns it with no apartment or room when neither is set`() =
        runBlocking {
            val service = ExpenseTemplateService()

            service.createExpenseTemplate(
                AddExpenseTemplateRequest(
                    apartmentId = null, roomId = null, amount = 300.0,
                    category = ExpenseCategory.OWNER_RENT, expenseDate = "10"
                )
            )

            val templates = service.findAll()
            assertEquals(1, templates.size)
            val template = templates.single()
            assertEquals(300.0, template.amount)
            assertEquals(10, template.dayOfMonth)
            assertTrue(template.active)
            assertNull(template.apartment)
            assertNull(template.room)
        }

    @Test
    fun `findAll includes the apartment and room when the template is scoped to one`() = runBlocking {
        val apartmentId = database.insertApartment("Mieszkanie A")
        val roomId = database.insertRoom(apartmentId, "Pokój 1")
        ExpenseTemplateService().createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = apartmentId, roomId = roomId, amount = 50.0,
                category = ExpenseCategory.UTILITY_WATER_COLD, expenseDate = "5"
            )
        )

        val template = ExpenseTemplateService().findAll().single()

        assertEquals(apartmentId, template.apartment?.id)
        assertEquals(roomId, template.room?.id)
    }

    @Test
    fun `updateExpenseTemplate only overwrites the provided fields`() = runBlocking {
        val service = ExpenseTemplateService()
        service.createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = null, roomId = null, amount = 100.0,
                category = ExpenseCategory.OTHER, expenseDate = "10"
            )
        )
        val id = service.findAll().single().id

        service.updateExpenseTemplate(
            id,
            UpdateExpenseTemplate(apartmentId = null, roomId = null, amount = 150.0, category = null, expenseDate = null)
        )

        val updated = service.findAll().single()
        assertEquals(150.0, updated.amount)
        assertEquals(ExpenseCategory.OTHER, updated.category)
        assertEquals(10, updated.dayOfMonth)
    }

    @Test
    fun `findAll keeps the order after a template is updated or deactivated`() = runBlocking {
        val service = ExpenseTemplateService()
        val ids = (1..3).map { service.createExpenseTemplate(template()) }

        service.updateExpenseTemplate(
            ids.first(),
            UpdateExpenseTemplate(apartmentId = null, roomId = null, amount = 999.0, category = null, expenseDate = null)
        )
        service.deleteExpenseTemplate(ids[1])

        assertEquals(ids, service.findAll().map { it.id })
    }

    @Test
    fun `updateExpenseTemplate rejects a deactivated template and leaves it unchanged`() = runBlocking {
        val service = ExpenseTemplateService()
        val id = service.createExpenseTemplate(template())
        database.deactivateExpenseTemplate(id)

        assertApiError("EXPENSE_TEMPLATE_INACTIVE") {
            service.updateExpenseTemplate(
                id,
                UpdateExpenseTemplate(apartmentId = null, roomId = null, amount = 999.0, category = null, expenseDate = null)
            )
        }
        assertEquals(100.0, service.findAll().single().amount)
    }

    @Test
    fun `createExpenseTemplate returns the id of the new template`() = runBlocking {
        val service = ExpenseTemplateService()

        val id = service.createExpenseTemplate(template())

        assertEquals(service.findAll().single().id, id)
    }

    @Test
    fun `createExpenseTemplate rejects an unknown apartment or room`() {
        val apartmentId = database.insertApartment("Mieszkanie A")

        assertApiError("APARTMENT_NOT_FOUND") { ExpenseTemplateService().createExpenseTemplate(template(apartmentId = 999)) }
        assertApiError("ROOM_NOT_FOUND") {
            ExpenseTemplateService().createExpenseTemplate(template(apartmentId = apartmentId, roomId = 999))
        }
    }

    @Test
    fun `updateExpenseTemplate rejects an unknown apartment or room`() {
        val service = ExpenseTemplateService()
        val id = runBlocking { service.createExpenseTemplate(template()) }

        assertApiError("APARTMENT_NOT_FOUND") { service.updateExpenseTemplate(id, update(apartmentId = 999)) }
        assertApiError("ROOM_NOT_FOUND") { service.updateExpenseTemplate(id, update(roomId = 999)) }
    }

    @Test
    fun `updateExpenseTemplate reports the missing template before an unknown apartment`() {
        assertApiError("EXPENSE_TEMPLATE_NOT_FOUND") {
            ExpenseTemplateService().updateExpenseTemplate(999, update(apartmentId = 999))
        }
    }

    @Test
    fun `deleteExpenseTemplate rejects an unknown template`() {
        assertApiError("EXPENSE_TEMPLATE_NOT_FOUND") { ExpenseTemplateService().deleteExpenseTemplate(999) }
    }

    private fun template(apartmentId: Int? = null, roomId: Int? = null) = AddExpenseTemplateRequest(
        apartmentId = apartmentId, roomId = roomId, amount = 100.0,
        category = ExpenseCategory.OTHER, expenseDate = "10"
    )

    private fun update(apartmentId: Int? = null, roomId: Int? = null) = UpdateExpenseTemplate(
        apartmentId = apartmentId, roomId = roomId, amount = null, category = null, expenseDate = null
    )

    // Soft-delete: templates that already generated real expenses are linked via a FK
    // (operational_expense.template_id) with no cascade, so a hard DELETE would blow up on those.
    // deleteExpenseTemplate deactivates the row instead - it stays in findAll() with active=false.
    @Test
    fun `deleteExpenseTemplate deactivates the template instead of removing it`() = runBlocking {
        val service = ExpenseTemplateService()
        service.createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = null, roomId = null, amount = 100.0,
                category = ExpenseCategory.OTHER, expenseDate = "10"
            )
        )
        val id = service.findAll().single().id

        service.deleteExpenseTemplate(id)

        val template = service.findAll().single()
        assertEquals(id, template.id)
        assertTrue(!template.active)
    }
}
