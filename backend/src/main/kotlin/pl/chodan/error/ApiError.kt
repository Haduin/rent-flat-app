package pl.chodan.error

import io.ktor.http.*
import kotlinx.serialization.Serializable

@Serializable
enum class ErrorCode(val status: HttpStatusCode) {
    VALIDATION_FAILED(HttpStatusCode.BadRequest),
    INVALID_PAYLOAD(HttpStatusCode.BadRequest),
    UNAUTHORIZED(HttpStatusCode.Unauthorized),
    INTERNAL_ERROR(HttpStatusCode.InternalServerError),

    APARTMENT_NOT_FOUND(HttpStatusCode.NotFound),
    ROOM_NOT_FOUND(HttpStatusCode.NotFound),
    ROOM_IN_USE(HttpStatusCode.Conflict),
    CONTRACT_NOT_FOUND(HttpStatusCode.NotFound),
    CONTRACT_TERMINATED(HttpStatusCode.Conflict),
    PERSON_NOT_FOUND(HttpStatusCode.NotFound),
    PERSON_IN_USE(HttpStatusCode.Conflict),
    PAYMENT_NOT_FOUND(HttpStatusCode.NotFound),
    PAYMENT_NOT_SPLITTABLE(HttpStatusCode.Conflict),
    PAYMENT_NOT_CONFIRMABLE(HttpStatusCode.Conflict),
    PAYMENT_OVERPAID(HttpStatusCode.Conflict),
    EXPENSE_NOT_FOUND(HttpStatusCode.NotFound),
    EXPENSE_NOT_CONFIRMABLE(HttpStatusCode.Conflict),
    EXPENSE_TEMPLATE_NOT_FOUND(HttpStatusCode.NotFound),
    EXPENSE_ALREADY_GENERATED(HttpStatusCode.Conflict),
}

@Serializable
data class ApiError(
    val code: ErrorCode,
    val message: String,
    val details: List<String> = emptyList(),
)
