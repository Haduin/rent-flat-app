import {useCallback, useState} from 'react';
import {ContractDto, DeleteContractDTO, PersonDto} from "../../components/commons/types.ts";
import {queryClient} from "../../main.tsx";
import {useToast} from "../../components/commons/ToastProvider.tsx";
import {useMutation, useQuery} from "@tanstack/react-query";
import {api} from "../../api/api.ts";
import {useModal} from "../../hooks/use-modal";

export const useContractsView = () => {
    const {showToast} = useToast()
    const [selectedContract, setSelectedContract] = useState<ContractDto | null>(null);
    const [showOnlyActiveContracts, setShowOnlyActiveContracts] = useState<boolean>(true);

    const {isOpen: isAddContractDialogVisible, setOpen: setIsAddContractDialogVisible} = useModal()
    const {isOpen: isDetailsDialogVisible, setOpen: setIsDetailsDialogVisible} = useModal()
    const {isOpen: isEditContractVisible, setOpen: setIsEditContractVisible} = useModal()
    const {isOpen: isDeleteDialogVisible, setOpen: setIsDeleteDialogVisible} = useModal()

    const handleOpenDetailsDialog = (selectedContract: ContractDto) => {
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

    const handleOpenEditDialog = (contract: ContractDto) => {
        setSelectedContract(contract);
        setIsEditContractVisible(true);
    }

    const handleCloseEditDialog = () => {
        setIsEditContractVisible(false);
        setSelectedContract(null);
    }

    const handleOpenDeleteDialog = (contract: ContractDto) => {
        setSelectedContract(contract);
        setIsDeleteDialogVisible(true);
    }

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
        setSelectedContract(null);
    }

    const {data: contracts = [], isLoading: loading} = useQuery<ContractDto[]>({
        queryKey: ['contracts'],
        queryFn: api.contractsApi.fetchContracts
    });

    const {data: unassignedPersons = []} = useQuery<PersonDto[]>({
        queryKey: ['unassignedPersons'],
        queryFn: api.contractsApi.fetchUnassignedPersons
    });

    const addContractMutation = useMutation({
        mutationFn: api.contractsApi.addContract,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['contracts']});
            showToast('success', 'Pomyślnie dodano nowy kontrakt.');
            closeAddDialog();
        },
        onError: () => {
            showToast('error', "Wystąpił błąd podczas dodawania kontraktu");
        }
    });

    const updateContractMutation = useMutation({
        mutationFn: ({contractId, contract}: { contractId: number, contract: any }) =>
            api.contractsApi.updateContract(contractId, contract),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['contracts']});
            showToast('success', 'Pomyślnie zaktualizowano kontrakt.');
            handleCloseEditDialog();
        },
        onError: () => {
            showToast('error', "Wystąpił błąd podczas aktualizacji kontraktu");
        }
    });

    const deleteContractMutation = useMutation({
        mutationFn: ({details}: {
            details: DeleteContractDTO
        }) => api.contractsApi.deleteContract(details),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['contracts']});
            showToast('success', 'Pomyślnie zamknięto kontrakt.');
            handleCloseDeleteDialog();
        },
        onError: () => {
            showToast('error', "Wystąpił błąd podczas zamykania kontraktu");
        }
    });


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
        updateContractMutation,

        isDeleteDialogVisible,
        handleOpenDeleteDialog,
        handleCloseDeleteDialog,
        deleteContractMutation,
        showOnlyActiveContracts, setShowOnlyActiveContracts,
        showContracts
    }
}
