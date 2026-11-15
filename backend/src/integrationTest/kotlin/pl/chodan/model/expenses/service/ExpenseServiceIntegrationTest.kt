package pl.chodan.model.expenses.service

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.jetbrains.exposed.exceptions.ExposedSQLException
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import pl.chodan.database.OperationalExpense
import pl.chodan.database.ExpenseCategory
import pl.chodan.database.OperationalExpenseTemplate
import pl.chodan.database.PaymentStatus
import pl.chodan.model.expenses.dto.AddExpenseTemplateRequest
import pl.chodan.model.expenses.dto.ExpenseConfirmationDTO
import pl.chodan.model.expenses.dto.NewOperationalExpenseDTO
import pl.chodan.model.expenses.dto.UpdateExpenseTemplate
import pl.chodan.model.expenses.dto.UpdateOperationalExpenseDTO
import pl.chodan.testutil.connectWithoutRetries
import pl.chodan.testutil.assertApiError
import pl.chodan.testutil.cleanTables
import pl.chodan.testutil.connectTestDatabase
import pl.chodan.testutil.deactivateExpenseTemplate
import pl.chodan.testutil.runAgainstUncommittedCompetitor
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.ultis.YearMonthString
import java.time.LocalDate

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
    fun `confirmExpense marks the expense as paid with the given date and amount`() = runBlocking {
        val service = ExpenseService()
        val id = service.addExpense(
            NewOperationalExpenseDTO(
                apartmentId = null, roomId = null, insertDate = "2026-08-04", costDate = null,
                amount = 150.0, category = ExpenseCategory.UTILITY_ELECTRICITY, description = null, invoiceNumber = null
            )
        )

        service.confirmExpense(ExpenseConfirmationDTO(expenseId = id, paidDate = "2026-08-10", payedAmount = 145.0))

        val confirmed = service.getExpenses(YearMonthString.parse("2026-08"), null, null).single()
        assertEquals(PaymentStatus.PAID, confirmed.status)
        assertEquals("2026-08-10", confirmed.paidDate)
        assertEquals(145.0, confirmed.amount)
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

    @Test
    fun `generateMonthlyExpenses does not add a second expense after the template day changes`() = runBlocking {
        val templateService = ExpenseTemplateService()
        templateService.createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = null, roomId = null, amount = 1550.0,
                category = ExpenseCategory.OWNER_RENT, expenseDate = "21"
            )
        )
        val service = ExpenseService()
        service.generateMonthlyExpenses("2026-08")

        val templateId = templateService.findAll().single().id
        templateService.updateExpenseTemplate(
            templateId,
            UpdateExpenseTemplate(apartmentId = null, roomId = null, amount = null, category = null, expenseDate = "10")
        )
        service.generateMonthlyExpenses("2026-08")

        assertEquals(1, service.getExpenses(YearMonthString.parse("2026-08"), null, null).size)
    }

    @Test
    fun `deleteExpense throws EXPENSE_NOT_FOUND for a missing expense`() {
        assertApiError("EXPENSE_NOT_FOUND") { ExpenseService().deleteExpense(12345) }
    }

    @Test
    fun `confirmExpense on a paid expense throws EXPENSE_NOT_CONFIRMABLE`() = runBlocking {
        val service = ExpenseService()
        val id = service.addExpense(manualExpense(insertDate = "2026-08-04"))
        service.confirmExpense(ExpenseConfirmationDTO(expenseId = id, paidDate = "2026-08-10", payedAmount = 145.0))

        assertApiError("EXPENSE_NOT_CONFIRMABLE") {
            service.confirmExpense(ExpenseConfirmationDTO(expenseId = id, paidDate = "2026-08-12", payedAmount = 99.0))
        }
        assertEquals(145.0, service.getExpenses(YearMonthString.parse("2026-08"), null, null).single().amount)
    }

    @Test
    fun `addExpense with an unknown room throws ROOM_NOT_FOUND`() {
        assertApiError("ROOM_NOT_FOUND") { ExpenseService().addExpense(manualExpense("2026-08-04").copy(roomId = 999)) }
    }

    @Test
    fun `addExpense for a template already generated in that month throws EXPENSE_ALREADY_GENERATED`() = runBlocking {
        val templateId = createTemplate()
        insertExpense(templateId, insertDate = "2026-08-10")

        assertApiError("EXPENSE_ALREADY_GENERATED") {
            ExpenseService().addExpense(manualExpense("2026-08-21").copy(templateId = templateId))
        }
        assertEquals(1, ExpenseService().getExpenses(YearMonthString.parse("2026-08"), null, null).size)
    }

    @Test
    fun `updateExpense moving a template expense into an occupied month throws EXPENSE_ALREADY_GENERATED`() = runBlocking {
        val templateId = createTemplate()
        insertExpense(templateId, insertDate = "2026-08-10")
        val septemberId = insertExpense(templateId, insertDate = "2026-09-10")

        assertApiError("EXPENSE_ALREADY_GENERATED") {
            ExpenseService().updateExpense(
                UpdateOperationalExpenseDTO(
                    id = septemberId, insertDate = "2026-08-20", costDate = null, amount = null,
                    category = null, description = null, invoiceNumber = null
                )
            )
        }
    }

    @Test
    fun `generateMonthlyExpenses waits for an uncommitted competitor and adds no duplicate (D12)`() = runBlocking {
        val templateId = createTemplate()
        // Exposed retries a transaction after an SQL error, which would hide the unique violation on retry.
        stopTestKoin()
        startTestKoin(connectWithoutRetries())

        val result = runAgainstUncommittedCompetitor(
            database,
            competitor = {
                OperationalExpenseTemplate.selectAll().where { OperationalExpenseTemplate.active eq true }
                    .orderBy(OperationalExpenseTemplate.id).forUpdate().toList()
                OperationalExpense.insert {
                    it[OperationalExpense.templateId] = templateId
                    it[insertDate] = LocalDate.of(2026, 8, 10)
                    it[amount] = 300.toBigDecimal()
                    it[category] = ExpenseCategory.OWNER_RENT
                    it[status] = PaymentStatus.PENDING
                }
            },
            service = { ExpenseService().generateMonthlyExpenses("2026-08") },
        )

        assertTrue(result.isSuccess, "$result")
        assertEquals(1, ExpenseService().getExpenses(YearMonthString.parse("2026-08"), null, null).size)
    }

    @Test
    fun `the database refuses a second expense from the same template in the same month`() = runBlocking {
        val templateService = ExpenseTemplateService()
        templateService.createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = null, roomId = null, amount = 300.0,
                category = ExpenseCategory.OWNER_RENT, expenseDate = "10"
            )
        )
        val templateId = templateService.findAll().single().id
        insertExpense(templateId, insertDate = "2026-08-04")

        assertThrows(ExposedSQLException::class.java) {
            insertExpense(templateId, insertDate = "2026-08-21")
        }
        assertEquals(1, ExpenseService().getExpenses(YearMonthString.parse("2026-08"), null, null).size)
    }

    @Test
    fun `the database accepts two manual expenses in the same month`() = runBlocking {
        insertExpense(templateId = null, insertDate = "2026-08-04")
        insertExpense(templateId = null, insertDate = "2026-08-04")

        assertEquals(2, ExpenseService().getExpenses(YearMonthString.parse("2026-08"), null, null).size)
    }

    private suspend fun createTemplate(): Int {
        val templateService = ExpenseTemplateService()
        templateService.createExpenseTemplate(
            AddExpenseTemplateRequest(
                apartmentId = null, roomId = null, amount = 300.0,
                category = ExpenseCategory.OWNER_RENT, expenseDate = "10"
            )
        )
        return templateService.findAll().single().id
    }

    private fun manualExpense(insertDate: String) = NewOperationalExpenseDTO(
        apartmentId = null, roomId = null, insertDate = insertDate, costDate = null,
        amount = 150.0, category = ExpenseCategory.OTHER, description = null, invoiceNumber = null
    )

    private fun insertExpense(templateId: Int?, insertDate: String): Int = transaction(database) {
        OperationalExpense.insert {
            it[OperationalExpense.templateId] = templateId
            it[OperationalExpense.insertDate] = LocalDate.parse(insertDate)
            it[amount] = 300.toBigDecimal()
            it[category] = ExpenseCategory.OWNER_RENT
            it[status] = PaymentStatus.PENDING
        } get OperationalExpense.id
    }

    @Test
    fun `updateExpense and confirmExpense throw EXPENSE_NOT_FOUND for a missing expense`() {
        assertApiError("EXPENSE_NOT_FOUND") {
            ExpenseService().updateExpense(
                UpdateOperationalExpenseDTO(
                    id = 12345, insertDate = null, costDate = null, amount = 10.0,
                    category = null, description = null, invoiceNumber = null
                )
            )
        }
        assertApiError("EXPENSE_NOT_FOUND") {
            ExpenseService().confirmExpense(ExpenseConfirmationDTO(expenseId = 12345, paidDate = "2026-08-10", payedAmount = 1.0))
        }
    }

    @Test
    fun `addExpense with an unknown template throws EXPENSE_TEMPLATE_NOT_FOUND`() {
        assertApiError("EXPENSE_TEMPLATE_NOT_FOUND") {
            ExpenseService().addExpense(manualExpense("2026-08-04").copy(templateId = 999))
        }
    }

    @Test
    fun `updateExpense of a template expense within its own month does not collide with itself`() = runBlocking {
        val id = insertExpense(createTemplate(), insertDate = "2026-08-10")

        ExpenseService().updateExpense(
            UpdateOperationalExpenseDTO(
                id = id, insertDate = "2026-08-20", costDate = null, amount = 999.0,
                category = null, description = null, invoiceNumber = null
            )
        )

        assertEquals(999.0, ExpenseService().getExpenses(YearMonthString.parse("2026-08"), null, null).single().amount)
    }
}
