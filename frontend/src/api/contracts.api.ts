import {
    ContractDto,
    DeleteContractDTO,
    NewContract,
    PersonDto,
    Room,
    UpdateContractDetails
} from "../components/commons/types.ts";
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
    updateContract: (contract: UpdateContractDetails) => axiosInstance.put(`/contracts/`, {data: contract}),
    deleteContract: (details: DeleteContractDTO) => axiosInstance.delete(`/contracts`, {data: details}),
    generateMouthPayments: (yearMonth: string) => axiosInstance.post(`/contracts/generateMonthlyPayments/${yearMonth}`)
}

export type ContractsApi = {
    fetchContracts: () => Promise<ContractDto[]>
    fetchUnassignedPersons: () => Promise<PersonDto[]>
    fetchUnassignedRooms: (startDate: string, endDate: string) => Promise<Room[]>,
    addContract: (newContract: NewContract) => Promise<void>
    updateContract: (contract: UpdateContractDetails) => Promise<void>
    deleteContract: (details: DeleteContractDTO) => Promise<void>
    generateMouthPayments: (yearMonth: string) => Promise<void>
};
