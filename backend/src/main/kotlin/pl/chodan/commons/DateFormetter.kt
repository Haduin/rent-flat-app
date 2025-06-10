package pl.chodan.commons

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

fun LocalDate.toFormattedString() = this.format(DateTimeFormatter.ofPattern("yyyy-MM"))
fun formatToFullTimestamp(input: String, inputPattern: String = "yyyy-MM-dd"): String {
    val parsedDate = LocalDateTime.parse("$input 00:00:00", DateTimeFormatter.ofPattern("$inputPattern HH:mm:ss"))
    return parsedDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
}

fun LocalDateTime.toFormattedString(pattern: String = "yyyy-MM-dd HH:mm:ss"): String {
    val formatter = DateTimeFormatter.ofPattern(pattern)
    return this.format(formatter)
}

fun String.toLocalDateWithFullPattern() = LocalDate.parse(this, DateTimeFormatter.ofPattern("yyyy-MM-dd"))
fun String.toLocalDateWithYearMonth() = LocalDate.parse(this, DateTimeFormatter.ofPattern("yyyy-MM"))
