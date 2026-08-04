import {ExpenseCategory} from "../../api/generated";

export interface AddExpenseTemplateRequest {
    apartmentId: number | null;
    roomId: number | null;
    amount: number;
    category: ExpenseCategory;
    expenseDate: string;
}
