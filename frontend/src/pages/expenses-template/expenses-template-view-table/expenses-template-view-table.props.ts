import {OperationalExpenseTemplateResponse} from "../../../api/generated";

export interface ExpensesTableProps {
    items: OperationalExpenseTemplateResponse[],
    loading: boolean,
    handleOnExpenseEdit: (selectedExpense: OperationalExpenseTemplateResponse) => void
}