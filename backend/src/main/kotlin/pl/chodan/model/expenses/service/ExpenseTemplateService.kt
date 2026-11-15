package pl.chodan.model.expenses.service

import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.leftJoin
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import pl.chodan.database.DatabaseProviderContract
import pl.chodan.database.OperationalExpenseTemplate
import pl.chodan.database.Room
import pl.chodan.model.apartment.database.Apartment
import pl.chodan.model.apartment.dto.ApartmentResponse
import pl.chodan.model.apartment.service.lockRoom
import pl.chodan.model.apartment.service.requireApartment
import pl.chodan.model.expenses.dto.AddExpenseTemplateRequest
import pl.chodan.model.expenses.dto.OperationalExpenseTemplateResponse
import pl.chodan.model.expenses.dto.UpdateExpenseTemplate
import pl.chodan.model.room.dto.RoomResponse

class ExpenseTemplateService : KoinComponent {
    private val databaseProvider by inject<DatabaseProviderContract>()

    suspend fun createExpenseTemplate(request: AddExpenseTemplateRequest): Int = databaseProvider.dbQuery {
        request.apartmentId?.let { requireApartment(it) }
        request.roomId?.let { lockRoom(it) }
        OperationalExpenseTemplate.insert {
            request.apartmentId?.let { apartmentId ->
                it[OperationalExpenseTemplate.apartmentId] = apartmentId
            }
            request.roomId?.let { roomId ->
                it[OperationalExpenseTemplate.roomId] = roomId
            }
            it[OperationalExpenseTemplate.amount] = request.amount.toBigDecimal()
            it[OperationalExpenseTemplate.category] = request.category
            it[OperationalExpenseTemplate.dayOfMonth] = request.expenseDate.toInt()
        } get OperationalExpenseTemplate.id
    }

    suspend fun findAll(): List<OperationalExpenseTemplateResponse> = databaseProvider.dbQuery {
        val query = OperationalExpenseTemplate
            .leftJoin(Apartment, { OperationalExpenseTemplate.apartmentId }, { Apartment.id })
            .leftJoin(Room, { OperationalExpenseTemplate.roomId }, { Room.id })
            .selectAll()

        query.map { row ->
            val apartmentId = row[OperationalExpenseTemplate.apartmentId]
            val roomId = row[OperationalExpenseTemplate.roomId]

            val apartment = apartmentId?.let {
                row.getOrNull(Apartment.id)?.let { id ->
                    ApartmentResponse(
                        id = id,
                        name = row[Apartment.name]
                    )
                }
            }

            val room = roomId?.let {
                row.getOrNull(Room.id)?.let { id ->
                    RoomResponse(
                        id = id,
                        name = row[Room.name],
                        apartmentId = row[Room.apartmentId] ?: 0
                    )
                }
            }

            OperationalExpenseTemplateResponse(
                id = row[OperationalExpenseTemplate.id],
                amount = row[OperationalExpenseTemplate.amount].toDouble(),
                category = row[OperationalExpenseTemplate.category],
                dayOfMonth = row[OperationalExpenseTemplate.dayOfMonth],
                active = row[OperationalExpenseTemplate.active],
                apartment = apartment,
                room = room
            )
        }
    }

    suspend fun updateExpenseTemplate(id: Int, updated: UpdateExpenseTemplate): Unit = databaseProvider.dbQuery {
        OperationalExpenseTemplate.selectAll().where { OperationalExpenseTemplate.id eq id }.forUpdate().singleOrNull()
            ?: throw ExpenseError.TemplateNotFound(id)
        updated.apartmentId?.let { requireApartment(it) }
        updated.roomId?.let { lockRoom(it) }
        OperationalExpenseTemplate.update({ OperationalExpenseTemplate.id eq id }) {
            updated.expenseDate?.let { value -> it[dayOfMonth] = value.toInt() }
            updated.category?.let { value -> it[category] = value }
            updated.amount?.let { value -> it[amount] = value.toBigDecimal() }
            updated.apartmentId?.let { value -> it[apartmentId] = value }
            updated.roomId?.let { value -> it[roomId] = value }
        }
    }

    // Soft-delete: szablony z już wygenerowanymi wydatkami są powiązane przez FK
    // (operational_expense.template_id), więc twardy DELETE naruszałby integralność
    // historii płatności. Dezaktywacja zatrzymuje dalsze generowanie kosztów
    // (patrz filtr `active eq true` w ExpenseService.generateExpensesFromTemplates)
    // i jest odzwierciedlana w UI przez istniejący status "Nieaktywny".
    suspend fun deleteExpenseTemplate(id: Int) = databaseProvider.dbQuery {
        val updatedRows = OperationalExpenseTemplate.update({ OperationalExpenseTemplate.id eq id }) {
            it[active] = false
        }
        if (0 == updatedRows) throw ExpenseError.TemplateNotFound(id)
    }
}
