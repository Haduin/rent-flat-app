import {useEffect, useState} from 'react';
import {Contract, NewContract} from "./types.ts";
import {apiClient} from "../../config/apiClient.ts";

export const useContractsView = () => {

    const [loading, setLoading] = useState<boolean>(false)
    const [isDetailsDialogVisible, setIsDetailsDialogVisible] = useState<boolean>(false);
    const [isAddContractDialogVisible, setIsAddContractDialogVisible] = useState<boolean>(false);
    const [contracts, setContracts] = useState<Contract[]>([]);
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

    const handleAddContract = async (newContract: NewContract) => {
        try {

        } catch (e) {
            const response = await apiClient.post('/contracts', {
                ...newContract
            })
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
    }
}