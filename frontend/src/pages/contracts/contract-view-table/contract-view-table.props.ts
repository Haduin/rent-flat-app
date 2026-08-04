import {ContractDTO} from "../../../api/generated";

export interface ContractTableProps {
    renderHeader: () => React.ReactElement;
    showContracts: () => ContractDTO[];
    handleOpenEditDialog: (contract: ContractDTO) => void;
    handleOpenDeleteDialog: (contract: ContractDTO) => void;
    handleOpenDetailsDialog: (contract: ContractDTO) => void;
}