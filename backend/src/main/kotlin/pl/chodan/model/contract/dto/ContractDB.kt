package pl.chodan.model.contract.dto

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.math.BigDecimal

@Serializable
data class ContractDB(
    val id: Int,
    val personId: Int,
    val roomId: Int,
    @Contextual
    val amount: BigDecimal?,
    @Contextual
    val deposit: BigDecimal?,
    val startDate: String?,
    val endDate: String?
)