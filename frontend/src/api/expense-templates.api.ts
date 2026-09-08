import {axiosInstance} from "./expenses-template.api.ts";
import {AddExpenseTemplateRequest, OperationalExpenseTemplateResponse} from "../pages/expenses/types.ts";

export const expenseTemplatesApi = new ExpenseTemplatesApi(config);


const baseUrl = "/expense-template"
export const expenseTemplatesApi: ExpenseTemplatesApi = {
    addExpenseTemplate: (expenseTemplate: AddExpenseTemplateRequest) => axiosInstance.post(baseUrl, expenseTemplate),
    findAll: (): Promise<OperationalExpenseTemplateResponse[]> => axiosInstance.get(baseUrl).then(res => res.data),
}

export type ExpenseTemplatesApi = {
    addExpenseTemplate: (expenseTemplate: AddExpenseTemplateRequest) => Promise<void>,
    findAll: () => Promise<OperationalExpenseTemplateResponse[]>
}