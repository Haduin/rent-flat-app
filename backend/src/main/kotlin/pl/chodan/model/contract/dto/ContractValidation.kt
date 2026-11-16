package pl.chodan.model.contract.dto

import io.ktor.server.plugins.requestvalidation.*
import pl.chodan.error.isIsoDate
import pl.chodan.error.toValidationResult
import java.time.LocalDate

fun RequestValidationConfig.contractValidation() {
    validate<NewContractDTO> { dto ->
        val errors = buildList {
            if (dto.amount <= 0) add("amount: kwota musi być większa od 0")
            if (dto.deposit < 0) add("deposit: kaucja nie może być ujemna")
            if (dto.payedDate !in 1..28) add("payedDate: dzień płatności musi być z zakresu 1-28")
            if (!dto.startDate.isIsoDate()) add("startDate: wymagany format yyyy-MM-dd")
            if (!dto.endDate.isIsoDate()) add("endDate: wymagany format yyyy-MM-dd")
            if (dto.startDate.isIsoDate() && dto.endDate.isIsoDate() && LocalDate.parse(dto.endDate) < LocalDate.parse(dto.startDate)) {
                add("endDate: koniec umowy nie może być przed jej początkiem")
            }
        }
        errors.toValidationResult()
    }
    validate<UpdateContractDetails> { dto ->
        val errors = buildList {
            val fields = listOf(dto.roomId, dto.amount, dto.deposit, dto.startDate, dto.endDate, dto.payedTillDayOfMonth)
            if (fields.all { null == it }) add("Podaj co najmniej jedno pole do zmiany")
            if (dto.amount != null && dto.amount <= 0) add("amount: kwota musi być większa od 0")
            if (dto.deposit != null && dto.deposit < 0) add("deposit: kaucja nie może być ujemna")
            if (dto.payedTillDayOfMonth != null && dto.payedTillDayOfMonth.toIntOrNull() !in 1..28) {
                add("payedTillDayOfMonth: dzień płatności musi być z zakresu 1-28")
            }
            if (dto.startDate != null && !dto.startDate.isIsoDate()) add("startDate: wymagany format yyyy-MM-dd")
            if (dto.endDate != null && !dto.endDate.isIsoDate()) add("endDate: wymagany format yyyy-MM-dd")
        }
        errors.toValidationResult()
    }
    validate<DeleteContractDTO> { dto ->
        if (dto.terminationDate.isIsoDate()) ValidationResult.Valid
        else ValidationResult.Invalid("terminationDate: wymagany format yyyy-MM-dd")
    }
}
