import {OperationalExpenseDTO} from "../../../../api/generated";

export interface ExpensesPaymentsViewTableProps {
    expenses: OperationalExpenseDTO[];
    removeAction: (operationId: number) => void;
}
