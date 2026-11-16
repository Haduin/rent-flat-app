package pl.chodan.model.apartment.dto

import io.ktor.server.plugins.requestvalidation.*

private const val MAX_NAME_LENGTH = 255

fun RequestValidationConfig.apartmentValidation() {
    validate<SaveNameRequest> { dto ->
        val name = dto.name.trim()
        when {
            name.isEmpty() -> ValidationResult.Invalid("name: nazwa jest wymagana")
            name.length > MAX_NAME_LENGTH ->
                ValidationResult.Invalid("name: nazwa może mieć najwyżej $MAX_NAME_LENGTH znaków")
            else -> ValidationResult.Valid
        }
    }
}
