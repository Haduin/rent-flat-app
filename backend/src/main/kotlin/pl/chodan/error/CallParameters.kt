package pl.chodan.error

import io.ktor.server.application.*
import pl.chodan.ultis.YearMonthString

fun ApplicationCall.intParam(name: String): Int =
    parameters[name]?.toIntOrNull() ?: throw ValidationException("Parametr '$name' musi być liczbą całkowitą")

fun ApplicationCall.optionalIntQuery(name: String): Int? =
    request.queryParameters[name]?.let { raw ->
        raw.toIntOrNull() ?: throw ValidationException("Parametr '$name' musi być liczbą całkowitą")
    }

// `parameters` covers both path segments and query string.
fun ApplicationCall.yearMonthQuery(name: String = "yearMonth"): YearMonthString =
    runCatching { YearMonthString.parse(parameters[name]) }
        .getOrElse { throw ValidationException("Parametr '$name' musi mieć format yyyy-MM") }

inline fun <reified T : Enum<T>> ApplicationCall.optionalEnumQuery(name: String): T? =
    request.queryParameters[name]?.let { raw ->
        enumValues<T>().firstOrNull { it.name == raw }
            ?: throw ValidationException("Parametr '$name' musi być jedną z wartości: ${enumValues<T>().joinToString()}")
    }

fun ApplicationCall.isoDateQuery(name: String): String =
    request.queryParameters[name]?.takeIf { it.isIsoDate() }
        ?: throw ValidationException("Parametr '$name' musi mieć format yyyy-MM-dd")
