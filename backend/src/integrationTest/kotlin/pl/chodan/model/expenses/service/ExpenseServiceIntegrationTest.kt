package pl.chodan.model.expenses.service

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pl.chodan.database.ExpenseCategory
import pl.chodan.model.expenses.dto.AddExpenseTemplateRequest
import pl.chodan.model.expenses.dto.NewOperationalExpenseDTO
import pl.chodan.testutil.cleanTables
import pl.chodan.testutil.connectTestDatabase
import pl.chodan.testutil.deactivateExpenseTemplate
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.ultis.YearMonthString

/**
 * Exercises ExpenseService against a real Postgres started via Testcontainers instead of mocks.
 * Where the MockK-based routing tests (src/test) verify HTTP wiring and status codes, this
 * verifies that the SQL Exposed actually generates - joins, BigDecimal/date mapping, the custom
 * enum column - round-trips correctly. Requires Docker; run with `./gradlew integrationTest`.
 */
class ExpenseServiceIntegrationTest {

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
    fun `addExpense persists an expense that getExpenses can find again`() = runBlocking {
        val service = ExpenseService()
        val dto = NewOperationalExpenseDTO(
            apartmentId = null,
            roomId = null,
            insertDate = "2026-08-04",
            costDate = null,
            amount = 150.0,
            category = ExpenseCategory.UTILITY_ELECTRICITY,
            description = "Prąd - sierpień",
            invoiceNumber = "FV/2026/08/01"
        )

        val id = service.addExpense(dto)

        val expenses = service.getExpenses(YearMonthString.parse("2026-08"), null, null)
        assertEquals(1, expenses.size)
        val saved = expenses.single()
        assertEquals(id, saved.id)
        assertEquals(150.0, saved.amount)
        assertEquals(ExpenseCategory.UTILITY_ELECTRICITY, saved.category)
        assertEquals("Prąd - sierpień", saved.description)
    }

    @Test
    fun `deleteExpense removes the row so it no longer matches getExpenses`() = runBlocking {
        val service = ExpenseService()
        val dto = NewOperationalExpenseDTO(
            apartmentId = null, roomId = null, insertDate = "2026-08-04", costDate = null,
            amount = 50.0, category = ExpenseCategory.OTHER, description = null, invoiceNumber = null
        )
        val id = service.addExpense(dto)

        service.deleteExpense(id)

        val expenses = service.getExpenses(YearMonthString.parse("2026-08"), null, null)
        assertEquals(0, expenses.size)
    }

    @Test
    fun `getExpenses only returns rows within the requested month`() = runBlocking {
        val service = ExpenseService()
        service.addExpense(
            NewOperationalExpenseDTO(
                apartmentId = null, roomId = null, insertDate = "2026-07-31", costDate = null,
                amount = 10.0, category = ExpenseCategory.OTHER, description = "July", invoiceNumber = null
            )
        )
        service.addExpense(
            NewOperationalExpenseDTO(
                apartmentId = null, roomId = null, insertDate = "2026-08-01", costDate = null,
                amount = 20.0, category = ExpenseCategory.OTHER, description = "August", invoiceNumber = null
            )
        )

        val augustExpenses = service.getExpenses(YearMonthString.parse("2026-08"), null, null)

        assertEquals(1, augustExpenses.size)
        assertEquals("August", augustExpenses.single().description)
    }

    @Test
    fun `generateMonthlyExpenses creates one expense per active template`() = runBlocking {
        val templateService = ExpenseTemplateService()
        templateService.createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = null, roomId = null, amount = 300.0,
                category = ExpenseCategory.OWNER_RENT, expenseDate = "10"
            )
        )

        ExpenseService().generateMonthlyExpenses("2026-08")

        val expenses = ExpenseService().getExpenses(YearMonthString.parse("2026-08"), null, null)
        assertEquals(1, expenses.size)
        assertEquals("2026-08-10", expenses.single().insertDate)
        assertEquals(300.0, expenses.single().amount)
    }

    @Test
    fun `generateMonthlyExpenses clamps the day of month to the last day of shorter months`() = runBlocking {
        val templateService = ExpenseTemplateService()
        templateService.createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = null, roomId = null, amount = 100.0,
                category = ExpenseCategory.OTHER, expenseDate = "31"
            )
        )

        ExpenseService().generateMonthlyExpenses("2026-02")

        val expenses = ExpenseService().getExpenses(YearMonthString.parse("2026-02"), null, null)
        assertEquals(1, expenses.size)
        assertEquals("2026-02-28", expenses.single().insertDate)
    }

    @Test
    fun `generateMonthlyExpenses skips inactive templates`() = runBlocking {
        val templateService = ExpenseTemplateService()
        templateService.createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = null, roomId = null, amount = 100.0,
                category = ExpenseCategory.OTHER, expenseDate = "10"
            )
        )
        templateService.createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = null, roomId = null, amount = 200.0,
                category = ExpenseCategory.TAX_ZUS, expenseDate = "15"
            )
        )
        val templates = templateService.findAll()
        database.deactivateExpenseTemplate(templates.first { it.category == ExpenseCategory.OTHER }.id)

        ExpenseService().generateMonthlyExpenses("2026-08")

        val expenses = ExpenseService().getExpenses(YearMonthString.parse("2026-08"), null, null)
        assertEquals(1, expenses.size)
        assertEquals(ExpenseCategory.TAX_ZUS, expenses.single().category)
    }

    @Test
    fun `generateMonthlyExpenses is idempotent when called twice for the same month`() = runBlocking {
        val templateService = ExpenseTemplateService()
        templateService.createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = null, roomId = null, amount = 300.0,
                category = ExpenseCategory.OWNER_RENT, expenseDate = "10"
            )
        )

        val service = ExpenseService()
        service.generateMonthlyExpenses("2026-08")
        service.generateMonthlyExpenses("2026-08")

        val expenses = service.getExpenses(YearMonthString.parse("2026-08"), null, null)
        assertEquals(1, expenses.size)
    }
}
