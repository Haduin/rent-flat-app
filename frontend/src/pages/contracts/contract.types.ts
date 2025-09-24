import {ContractDto, DeleteContractDTO} from "../../components/commons/types.ts";
import {UseMutationResult} from "@tanstack/react-query";

export interface DisableContractModalProps {
    isVisible: boolean;
    selectedContract: ContractDto | null
    onHide: () => void;
    onConfirm: UseMutationResult<void, Error, {
        details: DeleteContractDTO
    }>
}

export interface DeleteContractFormikValues {
    contractId: number;
    description: string;
    terminationDate: Date;
    depositReturned: boolean;
    positiveCancel: boolean;
}