package pl.chodan.error

abstract class ApiException(
    val code: ErrorCode,
    message: String,
    val details: List<String> = emptyList(),
) : RuntimeException(message)

class ValidationException(message: String, details: List<String> = emptyList()) :
    ApiException(ErrorCode.VALIDATION_FAILED, message, details)

