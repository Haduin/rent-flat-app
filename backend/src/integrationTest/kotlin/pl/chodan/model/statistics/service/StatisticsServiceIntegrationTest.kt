package pl.chodan.model.statistics.service

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pl.chodan.database.ExpenseCategory
import pl.chodan.database.PaymentStatus
import pl.chodan.model.contract.dto.NewContractDTO
import pl.chodan.model.contract.service.ContractService
import pl.chodan.model.expenses.dto.NewOperationalExpenseDTO
import pl.chodan.model.expenses.service.ExpenseService
import pl.chodan.model.persons.dto.CreatedPersonDTO
import pl.chodan.model.persons.service.PersonService
import pl.chodan.testutil.cleanTables
import pl.chodan.testutil.connectTestDatabase
import pl.chodan.testutil.insertApartment
import pl.chodan.testutil.insertPayment
import pl.chodan.testutil.insertPaymentSplit
import pl.chodan.testutil.insertRoom
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import java.time.LocalDate
import java.time.YearMonth

class StatisticsServiceIntegrationTest {

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

    // The service always reports "this month", so the fixtures are dated relative to today.
    private val currentMonth = YearMonth.now()

    private suspend fun createContract(apartmentId: Int, amount: Double): Int {
        val personId = PersonService().createPerson(CreatedPersonDTO("Jan", "Kowalski", "ABC123", "PL"))
        return ContractService().createContract(
            NewContractDTO(
                personId = personId, roomId = database.insertRoom(apartmentId),
                startDate = currentMonth.minusMonths(1).atDay(1).toString(),
                endDate = currentMonth.plusMonths(6).atEndOfMonth().toString(),
                amount = amount, deposit = amount, payedDate = 10
            )
        )
    }

    @Test
    fun `income counts what tenants actually paid so a partial payment adds only its instalments`() = runBlocking {
        val apartmentId = database.insertApartment()
        val month = currentMonth.toString()

        val fullyPaid = createContract(apartmentId, amount = 1000.0)
        database.insertPayment(fullyPaid, scopeDate = month, amount = 1000.0, status = PaymentStatus.PAID)

        val partlyPaid = createContract(apartmentId, amount = 1600.0)
        val partialPaymentId = database.insertPayment(
            partlyPaid, scopeDate = month, amount = 1600.0, status = PaymentStatus.PARTIALLY_PAID
        )
        database.insertPaymentSplit(partialPaymentId, amount = 300.0, paymentDate = LocalDate.now().toString())
        database.insertPaymentSplit(partialPaymentId, amount = 200.0, paymentDate = LocalDate.now().toString())

        val pending = createContract(apartmentId, amount = 900.0)
        database.insertPayment(pending, scopeDate = month, amount = 900.0, status = PaymentStatus.PENDING)

        for ((amount, status) in listOf(400.0 to PaymentStatus.PENDING, 250.0 to PaymentStatus.PAID)) {
            ExpenseService().addExpense(
                NewOperationalExpenseDTO(
                    apartmentId = apartmentId, roomId = null, insertDate = LocalDate.now().toString(),
                    costDate = null, amount = amount, category = ExpenseCategory.OWNER_RENT,
                    status = status, description = null, invoiceNumber = null, templateId = null
                )
            )
        }

        val statistics = StatisticsService().getApartmentsStatistics()

        val apartment = statistics.apartments.single()
        assertEquals(1500.0, apartment.currentMonthIncomeCollected)
        // only the paid cost counts, the pending 400 does not
        assertEquals(1500.0 - 250.0, apartment.netResultCurrentMonth)
        assertEquals(1500.0, statistics.overview.currentMonthIncomeCollected)
        assertEquals(3500.0, apartment.activeMonthlyRent)
    }
}
