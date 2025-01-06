import {useEffect, useState} from 'react';
import {Contract, NewContract, PersonDto} from "../commons/types.ts";
import {apiClient} from "../../config/apiClient.ts";
import {useToast} from "../commons/ToastProvider.tsx";

export const useContractsView = () => {
    const {showToast} = useToast()
    const [loading, setLoading] = useState<boolean>(false)
    const [isDetailsDialogVisible, setIsDetailsDialogVisible] = useState<boolean>(false);
    const [isAddContractDialogVisible, setIsAddContractDialogVisible] = useState<boolean>(false);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [unassignedPersons, setUnassignedPersons] = useState<PersonDto[]>([]);

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
        fetchUnassignedPersons()
            .then(() => setIsAddContractDialogVisible(true));
    }

    const handleAddContract = async (newContract: NewContract) => {
        try {
            const response = await apiClient.post('/contracts', {
                ...newContract
            })
            showToast('success', 'Pomyślnie dodano nowy kontrakt.')
            console.log(response);
        } catch (error) {
            showToast('error', "Wystąpił błąd podczas dodawania kontraktu");
        } finally {

        }
    }

    const fetchUnassignedPersons = async () => {
        try {
            const response = await apiClient.get<PersonDto[]>('/persons/non-residents');
            console.log(response);
            setUnassignedPersons(response.data);
        } catch (e) {
            console.error(e)
        }
    }

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<Contract[]>('/contracts');
            setContracts(response.data);
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchContracts()
    }, [])


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
        handleAddContract,
        unassignedPersons
    }
}