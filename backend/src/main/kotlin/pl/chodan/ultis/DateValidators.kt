package pl.chodan.ultis

class DateValidator {

    fun validateMonthParameter(monthParam: String?): ValidationResult {
        if (monthParam.isNullOrBlank()) {
            return ValidationResult.Error("Parameter 'month' is required in format yyyy-mm")
        }

        val monthRegex = Regex("^\\d{4}-\\d{2}$")
        if (!monthRegex.matches(monthParam)) {
            return ValidationResult.Error("Parameter 'month' must be in format yyyy-mm (e.g., 2024-03)")
        }

        val monthParts = monthParam.split("-")
        val month = monthParts[1].toIntOrNull()
        if (month == null || month !in 1..12) {
            return ValidationResult.Error("Month must be between 01 and 12")
        }

        return ValidationResult.Success(monthParam)
    }

    companion object {
        val instance = DateValidator()
    }
}

sealed class ValidationResult {
    data class Success(val value: String) : ValidationResult()
    data class Error(val message: String) : ValidationResult()
}
