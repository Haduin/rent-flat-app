package pl.chodan.services

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import org.slf4j.LoggerFactory
import pl.chodan.*
import pl.chodan.database.*
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter

class DashboardService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()
    private val logger = LoggerFactory.getLogger(DashboardService::class.java)

    suspend fun getDashboardData(timeRange: String): DashboardDataDTO {
        val months = when (timeRange) {
            "3m" -> 3
            "6m" -> 6
            "1y" -> 12
            else -> 6
        }

        val startDate = LocalDate.now().minusMonths(months.toLong())

        return databaseProvider.dbQuery {
            val incomeData = getIncomeData(startDate)
            val occupancyData = getOccupancyData(startDate)
            val paymentStatusData = getPaymentStatusData(startDate)
            val monthlyComparisonData = getMonthlyComparisonData(startDate)

            DashboardDataDTO(
                incomeData = incomeData,
                occupancyData = occupancyData,
                paymentStatusData = paymentStatusData,
                monthlyComparisonData = monthlyComparisonData
            )
        }
    }

    private fun getIncomeData(startDate: LocalDate): List<IncomeDataPoint> {
        val currentDate = LocalDate.now()
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM")

        val months = generateSequence(YearMonth.from(startDate)) { it.plusMonths(1) }
            .takeWhile { !it.isAfter(YearMonth.from(currentDate)) }
            .map { it.format(formatter) }
            .toList()

        val result = mutableListOf<IncomeDataPoint>()

        for (month in months) {
            val expectedQuery = Payment.selectAll().where { Payment.scopeDate eq month }
                .map { it[Payment.amount] }
                .sumOf { it.toDouble() }

            val receivedQuery = Payment.selectAll().where { (Payment.scopeDate eq month) and (Payment.status eq PaymentStatus.PAID) }
                .map { it[Payment.amount] }
                .sumOf { it.toDouble() }

            result.add(IncomeDataPoint(
                month = month,
                expected = expectedQuery,
                received = receivedQuery
            ))
        }

        return result
    }

    private fun getOccupancyData(startDate: LocalDate): List<OccupancyDataPoint> {
        val currentDate = LocalDate.now()
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM")

        val months = generateSequence(YearMonth.from(startDate)) { it.plusMonths(1) }
            .takeWhile { !it.isAfter(YearMonth.from(currentDate)) }
            .map { it.format(formatter) }
            .toList()

        val result = mutableListOf<OccupancyDataPoint>()

        for (month in months) {
            val monthDate = LocalDate.parse("$month-01")
            val totalRooms = Room.selectAll().count()

            val occupiedRooms = Contract.selectAll().where {
                (Contract.startDate lessEq monthDate) and 
                ((Contract.endDate greaterEq monthDate) or (Contract.terminationDate.isNull())) and
                (Contract.status eq ContractStatus.ACTIVE)
            }.count()

            val occupancyRate = if (totalRooms > 0) (occupiedRooms.toDouble() / totalRooms) * 100 else 0.0

            result.add(OccupancyDataPoint(
                month = month,
                totalRooms = totalRooms,
                occupiedRooms = occupiedRooms,
                occupancyRate = occupancyRate
            ))
        }

        return result
    }

    private fun getPaymentStatusData(startDate: LocalDate): List<PaymentStatusDataPoint> {
        val currentDate = LocalDate.now()
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM")

        val months = generateSequence(YearMonth.from(startDate)) { it.plusMonths(1) }
            .takeWhile { !it.isAfter(YearMonth.from(currentDate)) }
            .map { it.format(formatter) }
            .toList()

        val result = mutableListOf<PaymentStatusDataPoint>()

        for (month in months) {
            // Group payments by status for this month
            val paymentsByStatus = Payment.selectAll().where { Payment.scopeDate eq month }
                .groupBy { it[Payment.status] }

            // Create a list of status data points for this month
            val statusData = PaymentStatus.values().map { status ->
                val paymentsForStatus = paymentsByStatus[status] ?: emptyList()
                val count = paymentsForStatus.size
                val amount = paymentsForStatus.sumOf { it[Payment.amount].toDouble() }

                StatusDataPoint(
                    status = status.name,
                    count = count,
                    amount = amount
                )
            }

            result.add(PaymentStatusDataPoint(
                month = month,
                statusData = statusData
            ))
        }

        return result
    }

    private fun getMonthlyComparisonData(startDate: LocalDate): List<MonthlyComparisonDataPoint> {
        val currentDate = LocalDate.now()
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM")

        val months = generateSequence(YearMonth.from(startDate)) { it.plusMonths(1) }
            .takeWhile { !it.isAfter(YearMonth.from(currentDate)) }
            .map { it.format(formatter) }
            .toList()

        val result = mutableListOf<MonthlyComparisonDataPoint>()

        for (month in months) {
            val totalIncome = Payment.selectAll().where { 
                (Payment.scopeDate eq month) and (Payment.status eq PaymentStatus.PAID) 
            }.map { it[Payment.amount] }.sumOf { it.toDouble() }

            val previousMonth = YearMonth.parse(month).minusMonths(1).format(formatter)
            val previousIncome = Payment.selectAll().where { 
                (Payment.scopeDate eq previousMonth) and (Payment.status eq PaymentStatus.PAID) 
            }.map { it[Payment.amount] }.sumOf { it.toDouble() }

            val change = if (previousIncome > 0) ((totalIncome - previousIncome) / previousIncome) * 100 else 0.0

            result.add(MonthlyComparisonDataPoint(
                month = month,
                income = totalIncome,
                previousIncome = previousIncome,
                change = change
            ))
        }

        return result
    }
}
