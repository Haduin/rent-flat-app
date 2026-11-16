package pl.chodan

import java.time.LocalDate
import java.time.format.DateTimeFormatter

fun String.toLocalDateWithFullPattern(): LocalDate = LocalDate.parse(this, DateTimeFormatter.ofPattern("yyyy-MM-dd"))
