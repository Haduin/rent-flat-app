import {OperationalExpenseTemplateResponse} from "../../../api/generated";
import {ViewMode} from "../../../commons/view-mode.ts";

export interface AddEditExpensesDialogProps {
    isVisible: boolean;
    onHide: () => void;
    mode: ViewMode | null;
    selectedExpense: OperationalExpenseTemplateResponse | null
}
