package pl.chodan.model.statistics.service

import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.selectAll
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.OperationalExpense
import pl.chodan.database.Payment
import pl.chodan.database.PaymentStatus
import pl.chodan.database.Room
import pl.chodan.model.apartment.database.Apartment
import pl.chodan.model.contract.database.Contract
import pl.chodan.model.contract.database.ContractStatus
import pl.chodan.model.statistics.dto.ApartmentStatisticsDTO
import pl.chodan.model.statistics.dto.ApartmentsStatisticsOverviewDTO
import pl.chodan.model.statistics.dto.ApartmentsStatisticsResponse
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth

class StatisticsService : KoinComponent {

    private val databaseProvider by inject<DatabaseProviderContract>()

    private data class ContractRow(val apartmentId: Int, val roomId: Int, val amount: BigDecimal, val active: Boolean)
    private data class PaymentRow(val apartmentId: Int, val amount: BigDecimal, val scopeDate: String, val status: PaymentStatus)
    private data class ExpenseRow(val apartmentId: Int?, val amount: BigDecimal, val month: YearMonth)

    suspend fun getApartmentsStatistics(): ApartmentsStatisticsResponse = databaseProvider.dbQuery {
        val today = LocalDate.now()
        val currentMonth = YearMonth.from(today).toString()

        val apartmentNames = Apartment.selectAll().associate { it[Apartment.id] to it[Apartment.name] }

        val roomRows = Room.selectAll().toList()
        val roomsByApartment = roomRows.mapNotNull { row -> row[Room.apartmentId]?.let { it to row[Room.id] } }
            .groupBy({ it.first }, { it.second })
        val roomToApartment = roomsByApartment.entries
            .flatMap { (apartmentId, roomIds) -> roomIds.map { it to apartmentId } }
            .toMap()

        val contractRows = Contract
            .join(Room, JoinType.INNER, Contract.roomId, Room.id)
            .select(Contract.amount, Contract.status, Contract.startDate, Contract.endDate, Room.id, Room.apartmentId)
            .mapNotNull { row ->
                val apartmentId = row[Room.apartmentId] ?: return@mapNotNull null
                val isActive = row[Contract.status] == ContractStatus.ACTIVE &&
                        row[Contract.startDate] <= today && row[Contract.endDate] >= today
                ContractRow(apartmentId, row[Room.id], row[Contract.amount], isActive)
            }
        val contractsByApartment = contractRows.groupBy { it.apartmentId }

        val paymentRows = Payment
            .join(Contract, JoinType.INNER, Payment.contractId, Contract.id)
            .join(Room, JoinType.INNER, Contract.roomId, Room.id)
            .select(Payment.amount, Payment.status, Payment.scopeDate, Room.apartmentId)
            .mapNotNull { row ->
                val apartmentId = row[Room.apartmentId] ?: return@mapNotNull null
                PaymentRow(apartmentId, row[Payment.amount], row[Payment.scopeDate], row[Payment.status])
            }
        val paymentsByApartment = paymentRows.groupBy { it.apartmentId }

        val expenseRows = OperationalExpense.selectAll().map { row ->
            val apartmentId = row[OperationalExpense.apartmentId]
                ?: row[OperationalExpense.roomId]?.let { roomToApartment[it] }
            ExpenseRow(apartmentId, row[OperationalExpense.amount], YearMonth.from(row[OperationalExpense.insertDate]))
        }
        val expensesByApartment = expenseRows.filter { it.apartmentId != null }.groupBy { it.apartmentId!! }
        val unassignedCosts = expenseRows.filter { it.apartmentId == null }.sumOf { it.amount }

        val apartmentStats = apartmentNames.map { (apartmentId, apartmentName) ->
            val roomIds = roomsByApartment[apartmentId].orEmpty()
            val totalRooms = roomIds.size

            val contracts = contractsByApartment[apartmentId].orEmpty()
            val activeContracts = contracts.filter { it.active }
            val occupiedRooms = activeContracts.map { it.roomId }.distinct().size
            val freeRooms = totalRooms - occupiedRooms
            val occupancyRate = if (totalRooms > 0) occupiedRooms * 100.0 / totalRooms else 0.0

            val activeMonthlyRent = activeContracts.sumOf { it.amount }.toDouble()
            val averageRentPerOccupiedRoom = if (occupiedRooms > 0) activeMonthlyRent / occupiedRooms else 0.0
            val averageRentAllContracts =
                if (contracts.isNotEmpty()) contracts.sumOf { it.amount }.toDouble() / contracts.size else 0.0

            val payments = paymentsByApartment[apartmentId].orEmpty()
            val paidPayments = payments.filter { it.status == PaymentStatus.PAID || it.status == PaymentStatus.PARTIALLY_PAID }
            val totalIncomeCollected = paidPayments.sumOf { it.amount }.toDouble()
            val currentMonthIncomeCollected =
                paidPayments.filter { it.scopeDate == currentMonth }.sumOf { it.amount }.toDouble()

            val expenses = expensesByApartment[apartmentId].orEmpty()
            val totalCosts = expenses.sumOf { it.amount }.toDouble()
            val currentMonthCosts = expenses.filter { it.month.toString() == currentMonth }.sumOf { it.amount }.toDouble()
            val distinctExpenseMonths = expenses.map { it.month }.distinct().size
            val averageMonthlyCost = if (distinctExpenseMonths > 0) totalCosts / distinctExpenseMonths else 0.0

            ApartmentStatisticsDTO(
                apartmentId = apartmentId,
                apartmentName = apartmentName,
                totalRooms = totalRooms,
                occupiedRooms = occupiedRooms,
                freeRooms = freeRooms,
                occupancyRatePercent = occupancyRate,
                activeContractsCount = activeContracts.size,
                totalContractsCount = contracts.size,
                activeMonthlyRent = activeMonthlyRent,
                averageRentPerOccupiedRoom = averageRentPerOccupiedRoom,
                averageRentAllContracts = averageRentAllContracts,
                totalIncomeCollected = totalIncomeCollected,
                currentMonthIncomeCollected = currentMonthIncomeCollected,
                totalCosts = totalCosts,
                currentMonthCosts = currentMonthCosts,
                averageMonthlyCost = averageMonthlyCost,
                netResultCurrentMonth = currentMonthIncomeCollected - currentMonthCosts,
                netResultAllTime = totalIncomeCollected - totalCosts,
            )
        }.sortedBy { it.apartmentName }

        val totalRooms = apartmentStats.sumOf { it.totalRooms }
        val totalOccupiedRooms = apartmentStats.sumOf { it.occupiedRooms }
        val totalCostsAllTime = apartmentStats.sumOf { it.totalCosts } + unassignedCosts.toDouble()
        val totalIncomeCollectedAllTime = apartmentStats.sumOf { it.totalIncomeCollected }

        val overview = ApartmentsStatisticsOverviewDTO(
            totalApartments = apartmentStats.size,
            totalRooms = totalRooms,
            totalOccupiedRooms = totalOccupiedRooms,
            totalFreeRooms = totalRooms - totalOccupiedRooms,
            overallOccupancyRatePercent = if (totalRooms > 0) totalOccupiedRooms * 100.0 / totalRooms else 0.0,
            totalActiveMonthlyRent = apartmentStats.sumOf { it.activeMonthlyRent },
            totalIncomeCollectedAllTime = totalIncomeCollectedAllTime,
            currentMonthIncomeCollected = apartmentStats.sumOf { it.currentMonthIncomeCollected },
            totalCostsAllTime = totalCostsAllTime,
            currentMonthCosts = apartmentStats.sumOf { it.currentMonthCosts },
            unassignedCostsAllTime = unassignedCosts.toDouble(),
            netResultCurrentMonth = apartmentStats.sumOf { it.netResultCurrentMonth },
            netResultAllTime = totalIncomeCollectedAllTime - totalCostsAllTime,
        )

        ApartmentsStatisticsResponse(overview, apartmentStats)
    }
}
