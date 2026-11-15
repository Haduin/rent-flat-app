package pl.chodan

import java.time.LocalDate
import java.time.format.DateTimeParseException
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class CommonsTest {

    @Test
    fun `String toLocalDateWithFullPattern parses yyyy-MM-dd`() {
        assertEquals(LocalDate.of(2026, 8, 15), "2026-08-15".toLocalDateWithFullPattern())
    }

    @Test
    fun `String toLocalDateWithFullPattern rejects a yyyy-MM value`() {
        assertFailsWith<DateTimeParseException> { "2026-08".toLocalDateWithFullPattern() }
    }
}
