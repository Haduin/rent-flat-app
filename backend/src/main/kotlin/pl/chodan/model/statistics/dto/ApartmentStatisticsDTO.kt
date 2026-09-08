package pl.chodan.model.statistics.dto

import kotlinx.serialization.Serializable

@Serializable
data class ApartmentStatisticsDTO(
    val apartmentId: Int,
    val apartmentName: String,
    val totalRooms: Int,
    val occupiedRooms: Int,
    val freeRooms: Int,
    val occupancyRatePercent: Double,
    val activeContractsCount: Int,
    val totalContractsCount: Int,
    val activeMonthlyRent: Double,
    val averageRentPerOccupiedRoom: Double,
    val averageRentAllContracts: Double,
    val totalIncomeCollected: Double,
    val currentMonthIncomeCollected: Double,
    val totalCosts: Double,
    val currentMonthCosts: Double,
    val averageMonthlyCost: Double,
    val netResultCurrentMonth: Double,
    val netResultAllTime: Double,
)

@Serializable
data class ApartmentsStatisticsOverviewDTO(
    val totalApartments: Int,
    val totalRooms: Int,
    val totalOccupiedRooms: Int,
    val totalFreeRooms: Int,
    val overallOccupancyRatePercent: Double,
    val totalActiveMonthlyRent: Double,
    val totalIncomeCollectedAllTime: Double,
    val currentMonthIncomeCollected: Double,
    val totalCostsAllTime: Double,
    val currentMonthCosts: Double,
    val unassignedCostsAllTime: Double,
    val netResultCurrentMonth: Double,
    val netResultAllTime: Double,
)

@Serializable
data class ApartmentsStatisticsResponse(
    val overview: ApartmentsStatisticsOverviewDTO,
    val apartments: List<ApartmentStatisticsDTO>
)
