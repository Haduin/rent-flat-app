import {ContractDTO} from "../../../api/generated";

export interface ContractHistoryDialogProps {
    visible: boolean;
    onHide: () => void;
    selectedContract: ContractDTO | null;
}
