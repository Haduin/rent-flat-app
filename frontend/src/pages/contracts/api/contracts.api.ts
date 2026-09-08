import {useToast} from "../../../components/commons/ToastProvider.tsx";
import {DeleteContractDTO, NewContract} from "../../../components/commons/types.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import {client} from "../../../api/client.ts";
import {CONTRACTS_QUERY_KEY} from "../../../api/keys/contracts.ts";
import {
    ContractDTO,
    ContractHistoryDTO,
    GetNonOccupiedRoomsRequest,
    PersonDTO,
    type RoomWithApartmentDTO,
    UpdateContractDetails
} from "../../../api/generated";
import {UseAddContractProps, UseDeleteContractProps, UseEditContractProps} from "./contracts.api.props.ts";
import {queryClient} from "../../../main.tsx";
import {ROOMS_KEY} from "../../../api/keys/rooms.ts";

export const useContractsQuery = () => {
    return useQuery<ContractDTO[]>({
        queryKey: [CONTRACTS_QUERY_KEY.ALL_CONTRACTS],
        queryFn: () => client.contractsApi.getAllContracts(),
    });
};

export const useFetchRooms = () => {
    return useQuery<RoomWithApartmentDTO[]>({
        queryKey: [ROOMS_KEY.ALL_ROOMS],
        queryFn: () => client.roomsApi.getAllRooms(),
    })
}
export const useUnassignedPersonsQuery = () => {
    return useQuery<PersonDTO[]>({
        queryKey: [CONTRACTS_QUERY_KEY.UNASSIGNED_CONTRACTS_PERSON],
        queryFn: () => client.personApi.getNonResidentPersons(),
    });
};

export const useUnassignedRooms = (params?: GetNonOccupiedRoomsRequest) => {
    return useQuery<RoomWithApartmentDTO[]>({
        queryKey: [
            CONTRACTS_QUERY_KEY.UNASSIGNED_CONTRACTS_ROOMS,
            params?.startDate ?? null,
            params?.endDate ?? null,
        ],
        queryFn: () => {
            if (!params) return Promise.resolve([]);
            return client.roomsApi.getNonOccupiedRooms({
                startDate: params.startDate,
                endDate: params.endDate,
            });
        },
        enabled: !!params?.startDate && !!params?.endDate,
    });
};


export const useContractHistoryQuery = (contractId: number | null) => {
    return useQuery<ContractHistoryDTO[]>({
        queryKey: [CONTRACTS_QUERY_KEY.CONTRACT_HISTORY, contractId],
        queryFn: () => client.contractsApi.getContractHistory({id: contractId!}),
        enabled: contractId != null,
    });
};

export const useAddContractMutation = ({onSuccess, onError}: UseAddContractProps) => {
    const {showToast} = useToast();

    return useMutation({
        mutationFn: (params: NewContract) => client.contractsApi.createContract({newContractDTO: {...params}}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [CONTRACTS_QUERY_KEY.ALL_CONTRACTS]});
            showToast('success', 'Pomyślnie dodano nowy kontrakt.');
            onSuccess();
        },
        onError: (error: unknown) => {
            showToast('error', "Wystąpił błąd podczas dodawania kontraktu");
            onError?.(error);
        }
    });
};

export const useEditContractMutation = ({onSuccess, onError}: UseEditContractProps) => {
    const {showToast} = useToast();

    return useMutation({
        mutationFn: (contract: UpdateContractDetails) => client.contractsApi.updateContract({updateContractDetails: {...contract}}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [CONTRACTS_QUERY_KEY.ALL_CONTRACTS]});
            showToast('success', 'Pomyślnie zaktualizowano kontrakt.');
            onSuccess();
        },
        onError: (error: unknown) => {
            showToast('error', "Wystąpił błąd podczas aktualizacji kontraktu");
            onError?.(error);
        }
    });
};

export const useDeleteContractMutation = ({onSuccess, onError}: UseDeleteContractProps) => {
    const {showToast} = useToast();

    return useMutation({
        mutationFn: (details: DeleteContractDTO) => client.contractsApi.deleteContract({deleteContractDTO: {...details}}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [CONTRACTS_QUERY_KEY.ALL_CONTRACTS]});
            showToast('success', 'Pomyślnie zamknięto kontrakt.');
            onSuccess();
        },
        onError: (error: unknown) => {
            showToast('error', "Wystąpił błąd podczas zamykania kontraktu");
            onError?.(error);
        }
    });
};
