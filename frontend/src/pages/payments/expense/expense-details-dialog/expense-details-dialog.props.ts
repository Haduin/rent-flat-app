import {OperationalExpenseDTO} from "../../../../api/generated";

export interface ExpenseDetailsDialogProps {
    isVisible: boolean;
    onHide: () => void;
    selectedExpense: OperationalExpenseDTO | null;
}
