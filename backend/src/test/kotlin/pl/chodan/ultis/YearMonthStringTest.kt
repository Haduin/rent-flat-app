package pl.chodan.ultis

import java.time.YearMonth
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class YearMonthStringTest {

    @Test
    fun `parse accepts a valid yyyy-MM value`() {
        val result = YearMonthString.parse("2026-08")

        assertEquals("2026-08", result.toString())
        assertEquals(YearMonth.of(2026, 8), result.toYearMonth())
    }

    @Test
    fun `parse trims surrounding whitespace`() {
        val result = YearMonthString.parse("  2026-08  ")

        assertEquals("2026-08", result.toString())
    }

    @Test
    fun `parse rejects a null value`() {
        assertFailsWith<IllegalArgumentException> { YearMonthString.parse(null) }
    }

    @Test
    fun `parse rejects a blank value`() {
        assertFailsWith<IllegalArgumentException> { YearMonthString.parse("   ") }
    }

    @Test
    fun `parse rejects a malformed value`() {
        assertFailsWith<IllegalStateException> { YearMonthString.parse("not-a-month") }
    }

    @Test
    fun `parse rejects a full date instead of a month`() {
        assertFailsWith<IllegalStateException> { YearMonthString.parse("2026-08-15") }
    }
}
