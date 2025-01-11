import {useEffect, useState} from 'react';
import {Contract, NewContract, PersonDto, Room} from "../commons/types.ts";
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
    const [unassignedRooms, setUnassignedRooms] = useState<Room[]>([]);

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

    const fetchUnassignedRooms = async (startDate: string, endDate: string) => {
        try {
            const response = await apiClient.get<Room[]>('/rooms/non-occupied', {
                params: {
                    startDate: startDate,
                    endDate: endDate
                }
            });
            setUnassignedRooms(response.data);
        } catch (e) {
            console.error(e)
        }
    }

    const handleAddContract = async (newContract: NewContract) => {
        try {
            const response = await apiClient.post('/contracts', {
                ...newContract
            })
            console.log(response);
            showToast('success', 'Pomyślnie dodano nowy kontrakt.')
        } catch (error) {
            showToast('error', "Wystąpił błąd podczas dodawania kontraktu");
        } finally {

        }
    }

    const fetchUnassignedPersons = async () => {
        try {
            const response = await apiClient.get<PersonDto[]>('/persons/non-residents');
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
        Promise.all([fetchContracts(), fetchUnassignedPersons()])
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
        unassignedPersons,
        unassignedRooms,
        fetchUnassignedRooms
    }
}