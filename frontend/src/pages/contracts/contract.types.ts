import {DeleteContractDTO} from "../../components/commons/types.ts";
import {UseMutationResult} from "@tanstack/react-query";
import {ContractDTO} from "../../api/generated";

export interface DisableContractModalProps {
    isVisible: boolean;
    selectedContract: ContractDTO | null
    onHide: () => void;
    onConfirm: UseMutationResult<void, unknown, DeleteContractDTO, unknown>;
}

export interface DeleteContractFormikValues {
    contractId: number;
    description: string;
    terminationDate: Date;
    depositReturned: boolean;
    positiveCancel: boolean;
}