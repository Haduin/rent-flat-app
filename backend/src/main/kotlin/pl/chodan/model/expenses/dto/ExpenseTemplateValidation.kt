package pl.chodan.model.expenses.dto

import io.ktor.server.plugins.requestvalidation.*
import pl.chodan.error.toValidationResult

fun RequestValidationConfig.expenseTemplateValidation() {
    validate<AddExpenseTemplateRequest> { dto ->
        val errors = buildList {
            if (dto.amount <= 0) add("amount: kwota musi być większa od 0")
            if (!dto.expenseDate.isDayOfMonth()) add("expenseDate: dzień miesiąca musi być z zakresu 1-31")
        }
        errors.toValidationResult()
    }
    validate<UpdateExpenseTemplate> { dto ->
        val errors = buildList {
            if (listOf(dto.apartmentId, dto.roomId, dto.amount, dto.category, dto.expenseDate).all { null == it }) {
                add("Podaj co najmniej jedno pole do zmiany")
            }
            if (dto.amount != null && dto.amount <= 0) add("amount: kwota musi być większa od 0")
            if (dto.expenseDate != null && !dto.expenseDate.isDayOfMonth()) {
                add("expenseDate: dzień miesiąca musi być z zakresu 1-31")
            }
        }
        errors.toValidationResult()
    }
}

private fun String.isDayOfMonth() = toIntOrNull() in 1..31
