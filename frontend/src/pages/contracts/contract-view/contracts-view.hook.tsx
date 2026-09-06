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

export const useContractsView = () => {
    const [selectedContract, setSelectedContract] = useState<ContractDTO | null>(null);
    const [showOnlyActiveContracts, setShowOnlyActiveContracts] = useState<boolean>(true);

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
        return showOnlyActiveContracts ? contracts?.filter((contract) => contract.status === 'ACTIVE') : contracts
    }, [showOnlyActiveContracts, contracts])

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
        showContracts
    }
}
