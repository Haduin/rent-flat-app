import {useState} from 'react';
import {Contract, PersonDto} from "../../components/commons/types.ts";
import {queryClient} from "../../main.tsx";
import {useToast} from "../../components/commons/ToastProvider.tsx";
import {useMutation, useQuery} from "@tanstack/react-query";
import {api} from "../../api/api.ts";

export const useContractsView = () => {
    const {showToast} = useToast()
    const [isDetailsDialogVisible, setIsDetailsDialogVisible] = useState<boolean>(false);
    const [isAddContractDialogVisible, setIsAddContractDialogVisible] = useState<boolean>(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [isEditContactModalOpen, setIsEditContactModalOpen] = useState<boolean>(false);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<boolean>(false);

    const openDetailsDialog = (selectedContract: Contract) => {
        setIsDetailsDialogVisible(true);
        setSelectedContract(selectedContract);
    }

    const closeDetailsDialog = () => {
        setIsDetailsDialogVisible(false);
        setSelectedContract(null);
    }

    const closeAddDialog = () => {
        setIsAddContractDialogVisible(false);
    }

    const openAddDialog = () => {
        setIsAddContractDialogVisible(true);
    }

    const handleOpenEditDialog = (contract: Contract) => {
        setSelectedContract(contract);
        setIsEditContactModalOpen(true);
    }

    const handleCloseEditDialog = () => {
        setIsEditContactModalOpen(false);
        setSelectedContract(null);
    }

    const handleOpenDeleteDialog = (contract: Contract) => {
        setSelectedContract(contract);
        setIsDeleteDialogVisible(true);
    }

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
        setSelectedContract(null);
    }

    const {data: contracts = [], isLoading: loading} = useQuery<Contract[]>({
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
        mutationFn: ({contractId, contract}: {contractId: number, contract: any}) => 
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
        mutationFn: (contractId: number) => api.contractsApi.deleteContract(contractId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['contracts']});
            showToast('success', 'Pomyślnie usunięto kontrakt.');
            handleCloseDeleteDialog();
        },
        onError: () => {
            showToast('error', "Wystąpił błąd podczas usuwania kontraktu");
        }
    });

    return {
        contracts,
        loading,
        openDetailsDialog,
        closeDetailsDialog,
        isDetailsDialogVisible,
        selectedContract,
        isAddContractDialogVisible,
        closeAddDialog,
        openAddDialog,
        unassignedPersons,
        addContractMutation,

        isEditContactModalOpen,
        handleOpenEditDialog,
        handleCloseEditDialog,
        updateContractMutation,

        isDeleteDialogVisible,
        handleOpenDeleteDialog,
        handleCloseDeleteDialog,
        deleteContractMutation
    }
}
