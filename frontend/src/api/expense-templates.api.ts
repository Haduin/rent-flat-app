import {axiosInstance} from "./api.ts";

export const expenseTemplatesApi: ExpenseTemplatesApi = {
    generate: (yearMonth: string) => axiosInstance.post(`/expense-templates/generate`, null, {
        params: { yearMonth }
    }).then(res => res.data)
}

export type ExpenseTemplatesApi = {
    generate: (yearMonth: string) => Promise<{ created: number, createdIds: number[] }>
}