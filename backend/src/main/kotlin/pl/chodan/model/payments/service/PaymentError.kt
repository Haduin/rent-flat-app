package pl.chodan.model.payments.service

import pl.chodan.database.PaymentStatus
import pl.chodan.error.ApiException
import pl.chodan.error.ErrorCode
import java.math.BigDecimal

sealed class PaymentError(code: ErrorCode, message: String) : ApiException(code, message) {
    class NotFound(id: Int) : PaymentError(ErrorCode.PAYMENT_NOT_FOUND, "Nie znaleziono płatności o id $id")
    class NotSplittable(status: PaymentStatus) :
        PaymentError(ErrorCode.PAYMENT_NOT_SPLITTABLE, "Nie można podzielić płatności w statusie $status")
    class NotConfirmable(status: PaymentStatus) :
        PaymentError(ErrorCode.PAYMENT_NOT_CONFIRMABLE, "Nie można potwierdzić płatności w statusie $status")
    class Overpaid(remaining: BigDecimal) :
        PaymentError(ErrorCode.PAYMENT_OVERPAID, "Kwota wpłaty przekracza pozostałą do zapłaty kwotę $remaining")
}
