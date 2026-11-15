package pl.chodan.error

import io.ktor.server.plugins.requestvalidation.*
import java.time.LocalDate

fun String.isIsoDate() = runCatching { LocalDate.parse(this) }.isSuccess

fun List<String>.toValidationResult() =
    if (isEmpty()) ValidationResult.Valid else ValidationResult.Invalid(this)
