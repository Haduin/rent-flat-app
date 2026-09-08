import {ContractDTO} from "../../../api/generated";

export interface ContractDetailsModalProps {
    visible: boolean;
    onHide: () => void;
    selectedContract: ContractDTO | null;
}
