package pl.chodan.ultis

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

class DateValidatorTest {

    private val validator = DateValidator()

    @Test
    fun `validateMonthParameter accepts a valid yyyy-mm value`() {
        val result = validator.validateMonthParameter("2026-08")

        assertIs<ValidationResult.Success>(result)
        assertEquals("2026-08", result.value)
    }

    @Test
    fun `validateMonthParameter rejects a null value`() {
        val result = validator.validateMonthParameter(null)

        assertIs<ValidationResult.Error>(result)
        assertEquals("Parameter 'month' is required in format yyyy-mm", result.message)
    }

    @Test
    fun `validateMonthParameter rejects a blank value`() {
        val result = validator.validateMonthParameter("   ")

        assertIs<ValidationResult.Error>(result)
        assertEquals("Parameter 'month' is required in format yyyy-mm", result.message)
    }

    @Test
    fun `validateMonthParameter rejects a value with the wrong shape`() {
        val result = validator.validateMonthParameter("2026-8")

        assertIs<ValidationResult.Error>(result)
        assertEquals("Parameter 'month' must be in format yyyy-mm (e.g., 2024-03)", result.message)
    }

    @Test
    fun `validateMonthParameter rejects a full date instead of a month`() {
        val result = validator.validateMonthParameter("2026-08-15")

        assertIs<ValidationResult.Error>(result)
        assertEquals("Parameter 'month' must be in format yyyy-mm (e.g., 2024-03)", result.message)
    }

    @Test
    fun `validateMonthParameter rejects month zero`() {
        val result = validator.validateMonthParameter("2026-00")

        assertIs<ValidationResult.Error>(result)
        assertEquals("Month must be between 01 and 12", result.message)
    }

    @Test
    fun `validateMonthParameter rejects month thirteen`() {
        val result = validator.validateMonthParameter("2026-13")

        assertIs<ValidationResult.Error>(result)
        assertEquals("Month must be between 01 and 12", result.message)
    }

    @Test
    fun `validateMonthParameter accepts the boundary months`() {
        assertIs<ValidationResult.Success>(validator.validateMonthParameter("2026-01"))
        assertIs<ValidationResult.Success>(validator.validateMonthParameter("2026-12"))
    }
}
