package pl.chodan.model.expenses.dto

import io.ktor.server.plugins.requestvalidation.*
import pl.chodan.error.isIsoDate
import pl.chodan.error.toValidationResult

fun RequestValidationConfig.expenseValidation() {
    validate<NewOperationalExpenseDTO> { dto ->
        val errors = buildList {
            if (dto.amount <= 0) add("amount: kwota musi być większa od 0")
            if (!dto.insertDate.isIsoDate()) add("insertDate: wymagany format yyyy-MM-dd")
            if (dto.costDate != null && !dto.costDate.isIsoDate()) add("costDate: wymagany format yyyy-MM-dd")
        }
        errors.toValidationResult()
    }
    validate<UpdateOperationalExpenseDTO> { dto ->
        val errors = buildList {
            if (listOf(dto.insertDate, dto.costDate, dto.amount, dto.category, dto.description, dto.invoiceNumber).all { null == it }) {
                add("Podaj co najmniej jedno pole do zmiany")
            }
            if (dto.amount != null && dto.amount <= 0) add("amount: kwota musi być większa od 0")
            if (dto.insertDate != null && !dto.insertDate.isIsoDate()) add("insertDate: wymagany format yyyy-MM-dd")
            if (dto.costDate != null && !dto.costDate.isIsoDate()) add("costDate: wymagany format yyyy-MM-dd")
        }
        errors.toValidationResult()
    }
    validate<ExpenseConfirmationDTO> { dto ->
        val errors = buildList {
            if (dto.payedAmount <= 0) add("payedAmount: kwota musi być większa od 0")
            if (!dto.paidDate.isIsoDate()) add("paidDate: wymagany format yyyy-MM-dd")
        }
        errors.toValidationResult()
    }
}
