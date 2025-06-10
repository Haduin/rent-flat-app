package pl.chodan.kafka

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.apache.kafka.clients.producer.KafkaProducer
import org.apache.kafka.clients.producer.ProducerConfig
import org.apache.kafka.clients.producer.ProducerRecord
import org.apache.kafka.common.serialization.StringSerializer
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import pl.chodan.Event
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Properties
import kotlin.collections.set

class KafkaService {
    val producer: KafkaProducer<String, String>
    val logger: Logger = LoggerFactory.getLogger(KafkaService::class.java)
    init {
        val props = Properties()
        props[ProducerConfig.BOOTSTRAP_SERVERS_CONFIG] = "localhost:9092"
        props[ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG] = StringSerializer::class.java.name
        props[ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG] = StringSerializer::class.java.name

        producer = KafkaProducer(props)
    }

    inline fun <reified T> publishEvent(event: Event<T>, topic: String) {
        val eventJson = Json.encodeToString(event)
        val record = ProducerRecord(topic, event.eventId, eventJson)

        producer.send(record) { metadata, exception ->
            if (exception != null) {
                logger.error("Error sending event: ${exception.message}")
            } else {
                logger.info("Event sent to topic ${metadata.topic()}, partition ${metadata.partition()}, offset ${metadata.offset()}")
            }
        }
    }

    fun <T> createEvent(data: T): Event<T> {
        return Event(
            timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
            data = data
        )
    }
}