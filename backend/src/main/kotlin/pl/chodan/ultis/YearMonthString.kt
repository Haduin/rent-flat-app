package pl.chodan.ultis

import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

@JvmInline
value class YearMonthString private constructor(val value: String) {

    companion object {
        private val formatter = DateTimeFormatter.ofPattern("yyyy-MM")

        fun parse(raw: String?): YearMonthString {
            require(!raw.isNullOrBlank()) { "yearMonth is required" }

            val normalized = raw.trim()

            check(isValid(normalized)) {
                "Invalid yearMonth format. Expected yyyy-MM, got: $normalized"
            }

            return YearMonthString(normalized)
        }

        private fun isValid(value: String): Boolean {
            return try {
                YearMonth.parse(value, formatter)
                true
            } catch (_: DateTimeParseException) {
                false
            }
        }
    }

    fun toYearMonth(): YearMonth = YearMonth.parse(value, formatter)

    override fun toString(): String = value
}