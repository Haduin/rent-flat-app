import {useCallback, useState} from 'react';
import {useModal} from "../../../hooks/use-modal";
import {
    useAddContractMutation,
    useContractsQuery,
    useDeleteContractMutation,
    useEditContractMutation,
    useUnassignedPersonsQuery
} from "../api/contracts.api.ts";
import {ContractDTO} from "../../../api/generated";

export type ContractStatusFilter = "ACTIVE" | "TERMINATED" | "ALL";

export const useContractsView = () => {
    const [selectedContract, setSelectedContract] = useState<ContractDTO | null>(null);
    const [contractStatusFilter, setContractStatusFilter] = useState<ContractStatusFilter>("ACTIVE");

    // Kept for the legacy checkbox-driven UI, derived from the 3-way filter used by
    // the new UI's SelectButton so both consumers share this one hook without either
    // one needing to know about the other's representation of "which contracts to show".
    const showOnlyActiveContracts = "ACTIVE" === contractStatusFilter;
    const setShowOnlyActiveContracts = (onlyActive: boolean) =>
        setContractStatusFilter(onlyActive ? "ACTIVE" : "ALL");

    const {isOpen: isAddContractDialogVisible, setOpen: setIsAddContractDialogVisible} = useModal()
    const {isOpen: isDetailsDialogVisible, setOpen: setIsDetailsDialogVisible} = useModal()
    const {isOpen: isEditContractVisible, setOpen: setIsEditContractVisible} = useModal()
    const {isOpen: isDeleteDialogVisible, setOpen: setIsDeleteDialogVisible} = useModal()
    const {isOpen: isHistoryDialogVisible, setOpen: setIsHistoryDialogVisible} = useModal()

    const handleOpenDetailsDialog = (selectedContract: ContractDTO) => {
        setIsDetailsDialogVisible(true);
        setSelectedContract(selectedContract);
    }

    const handleCloseDetailsDialog = () => {
        setIsDetailsDialogVisible(false);
        setSelectedContract(null);
    }

    const closeAddDialog = () => {
        setIsAddContractDialogVisible(false);
    }

    const openAddDialog = () => {
        setIsAddContractDialogVisible(true);
    }

    const handleOpenEditDialog = (contract: ContractDTO) => {
        setSelectedContract(contract);
        setIsEditContractVisible(true);
    }

    const handleCloseEditDialog = () => {
        setIsEditContractVisible(false);
        setSelectedContract(null);
    }

    const handleOpenDeleteDialog = (contract: ContractDTO) => {
        setSelectedContract(contract);
        setIsDeleteDialogVisible(true);
    }

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
        setSelectedContract(null);
    }

    const handleOpenHistoryDialog = (contract: ContractDTO) => {
        setSelectedContract(contract);
        setIsHistoryDialogVisible(true);
    }

    const handleCloseHistoryDialog = () => {
        setIsHistoryDialogVisible(false);
        setSelectedContract(null);
    }

    const {data: contracts = [], isLoading: loading} = useContractsQuery()
    const {data: unassignedPersons = []} = useUnassignedPersonsQuery()

    const addContractMutation = useAddContractMutation({
        onSuccess: closeAddDialog,
    })

    const editContractMutation = useEditContractMutation({
        onSuccess: handleCloseEditDialog
    })

    const deleteContractMutation = useDeleteContractMutation({
        onSuccess: handleCloseDeleteDialog
    })


    const showContracts = useCallback(() => {
        if ("ALL" === contractStatusFilter) return contracts;
        return contracts?.filter((contract) => contractStatusFilter === contract.status)
    }, [contractStatusFilter, contracts])

    return {
        contracts,
        loading,
        handleOpenDetailsDialog,
        handleCloseDetailsDialog,
        isDetailsDialogVisible,
        selectedContract,
        isAddContractDialogVisible,
        closeAddDialog,
        openAddDialog,
        unassignedPersons,
        addContractMutation,

        isEditContractVisible,
        handleOpenEditDialog,
        handleCloseEditDialog,
        editContractMutation,

        isDeleteDialogVisible,
        handleOpenDeleteDialog,
        handleCloseDeleteDialog,
        deleteContractMutation,

        isHistoryDialogVisible,
        handleOpenHistoryDialog,
        handleCloseHistoryDialog,

        showOnlyActiveContracts, setShowOnlyActiveContracts,
        contractStatusFilter, setContractStatusFilter,
        showContracts
    }
}
