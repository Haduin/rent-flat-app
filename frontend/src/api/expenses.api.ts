import {axiosInstance} from "./api.ts";
import {NewOperationalExpense, OperationalExpense, UpdateOperationalExpense} from "../components/commons/types.ts";

export const expensesApi: ExpensesApi = {
    fetchExpenses: (apartmentId?: number, roomId?: number) => axiosInstance.get('/expenses', {
        params: { apartmentId, roomId }
    }).then(res => res.data),
    addExpense: (dto: NewOperationalExpense) => axiosInstance.post('/expenses', dto).then(res => res.data),
    updateExpense: (dto: UpdateOperationalExpense) => axiosInstance.put('/expenses', dto).then(res => res.data),
    deleteExpense: (id: number) => axiosInstance.delete(`/expenses/${id}`).then(res => res.data),
}

export type ExpensesApi = {
    fetchExpenses: (apartmentId?: number, roomId?: number) => Promise<OperationalExpense[]>,
    addExpense: (dto: NewOperationalExpense) => Promise<{ id: number }>,
    updateExpense: (dto: UpdateOperationalExpense) => Promise<void>,
    deleteExpense: (id: number) => Promise<void>,
}
