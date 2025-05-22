import {Contract, NewContract, PersonDto, Room} from "../components/commons/types.ts";
import {axiosInstance} from "./api.ts";

export const contractsApi: ContractsApi = {
    fetchContracts: () => axiosInstance.get("/contracts").then(response => response.data),
    fetchUnassignedPersons: () => axiosInstance.get("/persons/non-residents").then(response => response.data),
    fetchUnassignedRooms: (startDate: string, endDate: string) => axiosInstance.get('/rooms/non-occupied', {
        params: {
            startDate: startDate,
            endDate: endDate
        }
    }).then(response => response.data),
    addContract: (newContract: NewContract) => axiosInstance.post('/contracts', newContract),
    updateContract: (contractId: number, contract: NewContract) => axiosInstance.put(`/contracts/${contractId}`, contract),
    deleteContract: (contractId: number) => axiosInstance.delete(`/contracts/${contractId}`),
    generateMouthPayments: () => axiosInstance.post('/contracts/generateMonthlyPayments')
}

export type ContractsApi = {
    fetchContracts: () => Promise<Contract[]>
    fetchUnassignedPersons: () => Promise<PersonDto[]>
    fetchUnassignedRooms: (startDate: string, endDate: string) => Promise<Room[]>,
    addContract: (newContract: NewContract) => Promise<void>
    updateContract: (contractId: number, contract: NewContract) => Promise<void>
    deleteContract: (contractId: number) => Promise<void>
    generateMouthPayments: () => Promise<void>
};
