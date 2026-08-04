package pl.chodan.testutil

import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import pl.chodan.database.OperationalExpenseTemplate
import pl.chodan.database.Payment
import pl.chodan.database.PaymentStatus
import pl.chodan.database.Room
import pl.chodan.model.apartment.database.Apartment
import java.time.LocalDate

/**
 * Raw Exposed inserts for the handful of entities that have no "create" method on their own
 * service (Apartment, Room, Payment) - used only to set up fixture state for integration tests.
 * Wherever a real service create method exists (Person, Contract, ExpenseTemplate) tests should
 * use that instead, so fixture setup also exercises production code.
 */
fun Database.insertApartment(name: String = "Mieszkanie testowe"): Int = transaction(this) {
    Apartment.insert { it[Apartment.name] = name } get Apartment.id
}

fun Database.insertRoom(apartmentId: Int, name: String = "Pokój testowy"): Int = transaction(this) {
    Room.insert {
        it[Room.name] = name
        it[Room.apartmentId] = apartmentId
    } get Room.id
}

// ExpenseTemplateService.updateExpenseTemplate has its `active` handling commented out, so
// there is no production code path to deactivate a template. This exists purely to exercise
// ExpenseService.generateMonthlyExpenses' "skip inactive templates" branch in tests.
fun Database.deactivateExpenseTemplate(id: Int) = transaction(this) {
    OperationalExpenseTemplate.update({ OperationalExpenseTemplate.id eq id }) {
        it[active] = false
    }
}

fun Database.insertPayment(
    contractId: Int,
    scopeDate: String,
    amount: Double = 2000.0,
    status: PaymentStatus = PaymentStatus.PENDING,
    payedDate: String? = null
): Int = transaction(this) {
    Payment.insert {
        it[Payment.contractId] = contractId
        it[Payment.scopeDate] = scopeDate
        it[Payment.amount] = amount.toBigDecimal()
        it[Payment.status] = status
        it[Payment.payedDate] = payedDate?.let { d -> LocalDate.parse(d) }
    } get Payment.id
}
