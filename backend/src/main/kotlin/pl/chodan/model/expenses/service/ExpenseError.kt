package pl.chodan.model.expenses.service

import pl.chodan.database.PaymentStatus
import pl.chodan.error.ApiException
import pl.chodan.error.ErrorCode
import java.time.YearMonth

sealed class ExpenseError(code: ErrorCode, message: String) : ApiException(code, message) {
    class NotFound(id: Int) : ExpenseError(ErrorCode.EXPENSE_NOT_FOUND, "Nie znaleziono kosztu o id $id")
    class NotConfirmable(status: PaymentStatus) :
        ExpenseError(ErrorCode.EXPENSE_NOT_CONFIRMABLE, "Nie można potwierdzić kosztu w statusie $status")
    class TemplateNotFound(id: Int) :
        ExpenseError(ErrorCode.EXPENSE_TEMPLATE_NOT_FOUND, "Nie znaleziono szablonu kosztu o id $id")
    class AlreadyGenerated(yearMonth: YearMonth) :
        ExpenseError(ErrorCode.EXPENSE_ALREADY_GENERATED, "Koszt z tego szablonu dla miesiąca $yearMonth już istnieje")
}
