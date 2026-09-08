package pl.chodan

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeParseException
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class CommonsTest {

    @Test
    fun `LocalDate toFormattedString formats as yyyy-MM`() {
        val date = LocalDate.of(2026, 8, 15)

        assertEquals("2026-08", date.toFormattedString())
    }

    @Test
    fun `formatToFullTimestamp appends midnight and reformats the date`() {
        val result = formatToFullTimestamp("2026-08-15")

        assertEquals("2026-08-15 00:00:00", result)
    }

    @Test
    fun `formatToFullTimestamp accepts a custom input pattern`() {
        val result = formatToFullTimestamp("15/08/2026", inputPattern = "dd/MM/yyyy")

        assertEquals("2026-08-15 00:00:00", result)
    }

    @Test
    fun `formatToFullTimestamp rejects a value that does not match the input pattern`() {
        assertFailsWith<DateTimeParseException> { formatToFullTimestamp("15-08-2026") }
    }

    @Test
    fun `LocalDateTime toFormattedString uses the default pattern`() {
        val dateTime = LocalDateTime.of(2026, 8, 15, 13, 45, 30)

        assertEquals("2026-08-15 13:45:30", dateTime.toFormattedString())
    }

    @Test
    fun `LocalDateTime toFormattedString accepts a custom pattern`() {
        val dateTime = LocalDateTime.of(2026, 8, 15, 13, 45, 30)

        assertEquals("2026-08", dateTime.toFormattedString("yyyy-MM"))
    }

    @Test
    fun `String toLocalDateWithFullPattern parses yyyy-MM-dd`() {
        assertEquals(LocalDate.of(2026, 8, 15), "2026-08-15".toLocalDateWithFullPattern())
    }

    @Test
    fun `String toLocalDateWithFullPattern rejects a yyyy-MM value`() {
        assertFailsWith<DateTimeParseException> { "2026-08".toLocalDateWithFullPattern() }
    }

    @Test
    fun `String toLocalDateWithYearMonth parses yyyy-MM as the first day of the month`() {
        assertEquals(LocalDate.of(2026, 8, 1), "2026-08".toLocalDateWithYearMonth())
    }

    @Test
    fun `String toLocalDateWithYearMonth rejects a full date`() {
        assertFailsWith<DateTimeParseException> { "2026-08-15".toLocalDateWithYearMonth() }
    }
}
