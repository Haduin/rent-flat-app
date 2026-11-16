package pl.chodan.model.payments.service

import io.ktor.server.application.Application
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.koin.ktor.ext.inject
import org.slf4j.LoggerFactory
import java.time.LocalDate
import java.time.LocalDateTime
import kotlin.time.Duration.Companion.hours

private val INTERVAL = 24.hours

/** Once at startup and then every 24 h: PENDING payments past the contract's payment day become LATE. */
fun Application.launchLatePaymentsJob() {
    val paymentService by inject<PaymentService>()
    val logger = LoggerFactory.getLogger("LatePaymentsJob")
    logger.info(
        "Start zadania zaległych płatności: przy starcie i potem co {} płatności w statusie PENDING, " +
                "których dzień płatności z umowy (payedTillDayOfMonth; w krótszym miesiącu jego ostatni dzień) już minął, " +
                "dostają status LATE. Płatności częściowo opłacone, opłacone i anulowane nie są zmieniane.",
        INTERVAL
    )
    launch {
        while (isActive) {
            val today = LocalDate.now()
            val startedAt = System.currentTimeMillis()
            logger.info("Sprawdzanie zaległych płatności na dzień {}", today)
            try {
                val marked = paymentService.markLatePayments(today)
                logger.info(
                    "Oznaczono {} płatności jako zaległe (LATE) w {} ms. Następne sprawdzenie około {}",
                    marked, System.currentTimeMillis() - startedAt, LocalDateTime.now().plusHours(INTERVAL.inWholeHours)
                )
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                logger.error("Nie udało się oznaczyć zaległych płatności na dzień {}; ponowna próba za {}", today, INTERVAL, e)
            }
            delay(INTERVAL)
        }
    }
}
