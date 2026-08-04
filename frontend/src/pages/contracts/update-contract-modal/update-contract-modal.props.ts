import {ContractDTO, UpdateContractDetails} from "../../../api/generated";
import {UseMutationResult} from "@tanstack/react-query";

export interface UpdateContractModalProps {
    isVisible: boolean;
    onHide: () => void;
    onSave: UseMutationResult<void, unknown, UpdateContractDetails, unknown>
    selectedContract: ContractDTO | null;
}