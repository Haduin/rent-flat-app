import {ExpenseCategory, OperationalExpenseTemplateResponse} from "../../../api/generated";
import {FormValues} from "./add-edit-expenses-template-dialog.validation-schema.ts";
import {ExpenseScope, expensesMap} from "./add-edit-expenses-template-dialog.types.ts";

export const categoryOptions = (Object.entries(expensesMap) as [ExpenseCategory, string][]).map(
    ([key, value]) => ({
        label: value,
        value: key,
    })
);

const resolveExpenseScope = (selectedExpense: OperationalExpenseTemplateResponse): ExpenseScope => {
    if (selectedExpense.room) return 'room';
    if (selectedExpense.apartment) return 'property';
    return 'general';
}

export const mapSelectedToModel = (selectedExpense: OperationalExpenseTemplateResponse): FormValues => {
    return ({
        expenseType: resolveExpenseScope(selectedExpense),
        category: categoryOptions.find(elm => elm.value === selectedExpense.category)?.value ?? null,
        expenseDate: String(selectedExpense.dayOfMonth),
        amount: selectedExpense.amount,
        apartmentId: selectedExpense.apartment ? String(selectedExpense.apartment.id) : null,
        roomId: selectedExpense.room ? String(selectedExpense.room.id) : null
    })
}

export const useDefaultValues = (): FormValues => ({
    expenseType: 'general',
    amount: null,
    expenseDate: null,
    apartmentId: null,
    roomId: null,
    category: null,
})