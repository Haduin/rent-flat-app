package pl.chodan.error

import io.ktor.http.*
import io.ktor.serialization.*
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import io.ktor.server.plugins.requestvalidation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("pl.chodan.error.ErrorHandling")

val GENERIC_ERROR_CODES = setOf(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.INVALID_PAYLOAD,
    ErrorCode.UNAUTHORIZED,
    ErrorCode.INTERNAL_ERROR,
)

fun Application.configureErrorHandling(validators: RequestValidationConfig.() -> Unit) {
    install(RequestValidation, validators)

    monitor.subscribe(RoutingRoot.RoutingCallStarted) { call -> call.attributes.put(RoutingNodeKey, call.route) }

    install(StatusPages) {
        exception<ApiException> { call, cause ->
            if (cause.code !in GENERIC_ERROR_CODES && cause.code !in call.declaredErrors()) {
                logger.warn("Niezadeklarowany kod błędu ${cause.code} dla ${call.request.local.method.value} ${call.request.local.uri}")
            }
            call.respond(cause.code.status, ApiError(cause.code, cause.message ?: cause.code.name, cause.details))
        }
        exception<RequestValidationException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, ApiError(ErrorCode.VALIDATION_FAILED, "Nieprawidłowe dane", cause.reasons))
        }
        exception<BadRequestException> { call, _ ->
            call.respond(HttpStatusCode.BadRequest, ApiError(ErrorCode.INVALID_PAYLOAD, "Nieprawidłowy format żądania"))
        }
        // Ktor's engine turns CannotTransformContentToTypeException (wrong Content-Type) into a bare 415 before StatusPages sees it.
        status(HttpStatusCode.UnsupportedMediaType) { call, _ ->
            call.respond(HttpStatusCode.BadRequest, ApiError(ErrorCode.INVALID_PAYLOAD, "Nieprawidłowy format żądania"))
        }
        exception<JsonConvertException> { call, _ ->
            call.respond(HttpStatusCode.BadRequest, ApiError(ErrorCode.INVALID_PAYLOAD, "Nieprawidłowy format żądania"))
        }
        exception<Throwable> { call, cause ->
            logger.error("Nieobsłużony błąd dla ${call.request.local.method.value} ${call.request.local.uri}", cause)
            call.respond(HttpStatusCode.InternalServerError, ApiError(ErrorCode.INTERNAL_ERROR, "Wystąpił nieoczekiwany błąd"))
        }
    }
}
