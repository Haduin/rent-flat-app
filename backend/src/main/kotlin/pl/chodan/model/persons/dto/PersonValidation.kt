package pl.chodan.model.persons.dto

import io.ktor.server.plugins.requestvalidation.*
import pl.chodan.error.toValidationResult

fun RequestValidationConfig.personValidation() {
    validate<CreatedPersonDTO> { dto ->
        val errors = buildList {
            if (dto.firstName.isBlank()) add("firstName: imię jest wymagane")
            if (dto.lastName.isBlank()) add("lastName: nazwisko jest wymagane")
        }
        errors.toValidationResult()
    }
    validate<UpdatePersonDTO> { dto ->
        val errors = buildList {
            if (dto.firstName.isBlank()) add("firstName: imię jest wymagane")
            if (dto.lastName.isBlank()) add("lastName: nazwisko jest wymagane")
        }
        errors.toValidationResult()
    }
}
