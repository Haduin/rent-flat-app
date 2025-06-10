package pl.chodan

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import pl.chodan.kafka.KafkaService
import pl.chodan.kafka.KafkaTopics
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

//class UtilityCostsService {
//
//
//    suspend fun addCost(request: AddNewUtilityCostDTO) = dbQuery {
//        UtilityCosts.insert {
//            it[type] = request.type
//            it[insertDate] = formatToFullTimestamp(request.insertDate)
//            it[apartmentId] = request.apartmentId
//            it[value] = request.amount.toBigDecimal()
//        }
//    }
//
//    suspend fun getAllCostsForApartment(apartmentId: Int) = dbQuery {
//        UtilityCosts.selectAll().where { UtilityCosts.apartmentId eq apartmentId }.toList()
//    }
//
//}
private val kafkaService = KafkaService()

// Service for Apartment(

// Service for Room


// Service for Person






suspend fun <T> dbQuery(block: suspend () -> T): T =
    newSuspendedTransaction(Dispatchers.IO) { block() }
