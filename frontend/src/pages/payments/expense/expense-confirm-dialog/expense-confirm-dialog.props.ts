import {OperationalExpenseDTO} from "../../../../api/generated";

export interface ExpenseConfirmDialogProps {
    isVisible: boolean;
    onHide: () => void;
    onConfirm: (date: Date, expenseId: number, amount: number) => void;
    selectedExpense: OperationalExpenseDTO | null;
}
