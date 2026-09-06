package pl.chodan.model.statistics.routing

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.koin.dsl.module
import pl.chodan.model.statistics.dto.ApartmentStatisticsDTO
import pl.chodan.model.statistics.dto.ApartmentsStatisticsOverviewDTO
import pl.chodan.model.statistics.dto.ApartmentsStatisticsResponse
import pl.chodan.model.statistics.service.StatisticsService
import pl.chodan.testutil.installTestAuthentication
import pl.chodan.testutil.installTestContentNegotiation
import pl.chodan.testutil.startTestKoin
import pl.chodan.testutil.stopTestKoin
import pl.chodan.testutil.testAuthHeader
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class StatisticsRoutingTest {

    private val statisticsService = mockk<StatisticsService>()

    private fun ApplicationTestBuilder.setup() {
        startTestKoin(module { single { statisticsService } })
        application {
            installTestContentNegotiation()
            installTestAuthentication()
            configureStatisticsRouting()
        }
    }

    @AfterTest
    fun tearDown() {
        stopTestKoin()
    }

    private fun statisticsResponse() = ApartmentsStatisticsResponse(
        overview = ApartmentsStatisticsOverviewDTO(
            totalApartments = 1, totalRooms = 4, totalOccupiedRooms = 3, totalFreeRooms = 1,
            overallOccupancyRatePercent = 75.0, totalActiveMonthlyRent = 4500.0,
            totalIncomeCollectedAllTime = 13500.0, currentMonthIncomeCollected = 4500.0,
            totalCostsAllTime = 2000.0, currentMonthCosts = 500.0, unassignedCostsAllTime = 0.0,
            netResultCurrentMonth = 4000.0, netResultAllTime = 11500.0,
        ),
        apartments = listOf(
            ApartmentStatisticsDTO(
                apartmentId = 1, apartmentName = "Chmielna", totalRooms = 4, occupiedRooms = 3, freeRooms = 1,
                occupancyRatePercent = 75.0, activeContractsCount = 3, totalContractsCount = 5,
                activeMonthlyRent = 4500.0, averageRentPerOccupiedRoom = 1500.0, averageRentAllContracts = 1350.0,
                totalIncomeCollected = 13500.0, currentMonthIncomeCollected = 4500.0, totalCosts = 2000.0,
                currentMonthCosts = 500.0, averageMonthlyCost = 400.0, netResultCurrentMonth = 4000.0,
                netResultAllTime = 11500.0,
            )
        )
    )

    @Test
    fun `GET statistics apartments returns the aggregated statistics`() = testApplication {
        setup()
        coEvery { statisticsService.getApartmentsStatistics() } returns statisticsResponse()

        val response = client.get("/statistics/apartments") { testAuthHeader() }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals(1, body["overview"]!!.jsonObject["totalApartments"]!!.jsonPrimitive.content.toInt())
        assertEquals(1, body["apartments"]!!.jsonArray.size)
        assertEquals("Chmielna", body["apartments"]!!.jsonArray[0].jsonObject["apartmentName"]!!.jsonPrimitive.content)
        coVerify(exactly = 1) { statisticsService.getApartmentsStatistics() }
    }

    @Test
    fun `GET statistics apartments without an authenticated user is rejected`() = testApplication {
        setup()

        val response = client.get("/statistics/apartments")

        assertEquals(HttpStatusCode.Unauthorized, response.status)
        coVerify(exactly = 0) { statisticsService.getApartmentsStatistics() }
    }
}
