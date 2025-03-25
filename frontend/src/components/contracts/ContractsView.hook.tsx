import {useState} from 'react';
import {Contract, PersonDto, Room} from "../commons/types.ts";
import {queryClient} from "../../main.tsx";
import {useToast} from "../commons/ToastProvider.tsx";
import {useMutation, useQuery} from "@tanstack/react-query";
import {api} from "../../api/api.ts";

export const useContractsView = () => {
    const {showToast} = useToast()
    const [isDetailsDialogVisible, setIsDetailsDialogVisible] = useState<boolean>(false);
    const [isAddContractDialogVisible, setIsAddContractDialogVisible] = useState<boolean>(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

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

    const {data: contracts = [], isLoading: loading} = useQuery<Contract[]>({
        queryKey: ['contracts'],
        queryFn: api.contractsApi.fetchContracts
    });

    const {data: unassignedPersons = []} = useQuery<PersonDto[]>({
        queryKey: ['unassignedPersons'],
        queryFn: api.contractsApi.fetchUnassignedPersons
    });

    const fetchUnassignedRooms = (startDate: string, endDate: string) => {
        return useQuery<Room[]>({
            queryKey: ['unassignedRooms', startDate, endDate],
            queryFn: () => api.contractsApi.fetchUnassignedRooms(startDate, endDate),
            enabled: !!startDate && !!endDate
        });
    };

    const addContractMutation = useMutation({
        mutationFn: api.contractsApi.addContract,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['contracts']});
            showToast('success', 'Pomyślnie dodano nowy kontrakt.');
            setIsAddContractDialogVisible(false);
        },
        onError: () => {
            showToast('error', "Wystąpił błąd podczas dodawania kontraktu");
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
        fetchUnassignedRooms
    }
}