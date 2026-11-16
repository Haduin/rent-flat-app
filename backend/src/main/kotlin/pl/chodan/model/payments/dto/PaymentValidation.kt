package pl.chodan.model.payments.dto

import io.ktor.server.plugins.requestvalidation.*
import pl.chodan.error.isIsoDate
import pl.chodan.error.toValidationResult
import pl.chodan.model.persons.dto.PaymentConfirmationDTO

fun RequestValidationConfig.paymentValidation() {
    validate<PaymentConfirmationDTO> { dto ->
        val errors = buildList {
            if (dto.payedAmount <= 0) add("payedAmount: kwota musi być większa od 0")
            if (!dto.paymentDate.isIsoDate()) add("paymentDate: wymagany format yyyy-MM-dd")
        }
        errors.toValidationResult()
    }
    validate<PaymentEdit> { dto ->
        val errors = buildList {
            if (listOf(dto.amount, dto.payedDate).all { null == it }) add("Podaj co najmniej jedno pole do zmiany")
            if (dto.amount != null && dto.amount <= 0) add("amount: kwota musi być większa od 0")
            if (dto.payedDate != null && !dto.payedDate.isIsoDate()) add("payedDate: wymagany format yyyy-MM-dd")
        }
        errors.toValidationResult()
    }
    validate<PaymentSplitDTO> { dto ->
        val errors = buildList {
            if (dto.amount <= 0) add("amount: kwota wpłaty musi być większa od 0")
            if (!dto.paymentDate.isIsoDate()) add("paymentDate: wymagany format yyyy-MM-dd")
        }
        errors.toValidationResult()
    }
}
