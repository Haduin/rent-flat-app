import {OperationalExpenseDTO, UpdateOperationalExpenseDTO} from "../../../../api/generated";

export interface EditExpenseDialogProps {
    isVisible: boolean;
    onHide: () => void;
    selectedExpense: OperationalExpenseDTO | null;
    onConfirm: (dto: UpdateOperationalExpenseDTO) => void;
}
