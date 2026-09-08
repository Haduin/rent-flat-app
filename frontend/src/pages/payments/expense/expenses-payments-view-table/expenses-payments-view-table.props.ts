import {OperationalExpenseDTO} from "../../../../api/generated";

export interface ExpensesPaymentsViewTableProps {
    expenses: OperationalExpenseDTO[];
    onView: (expense: OperationalExpenseDTO) => void;
    onEdit: (expense: OperationalExpenseDTO) => void;
    onDelete: (expense: OperationalExpenseDTO) => void;
}
