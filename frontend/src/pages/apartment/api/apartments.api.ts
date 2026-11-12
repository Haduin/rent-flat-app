import {useMutation, useQuery} from "@tanstack/react-query"
import {APARTMENT_QUERY_KEYS} from "../../../api/keys/apartment.ts";
import {client} from "../../../api/client.ts";
import {type ApartmentWithRooms, ResponseError} from "../../../api/generated";
import {GetAllApartmentsProps} from "./apartments.api.props.ts";
import {useToast} from "../../../components/commons/ToastProvider.tsx";
import {queryClient} from "../../../main.tsx";
import {isEqual, isNullable} from "../../../utils/typeguards";

export const getApartments = ({
                                  enabled,
                              }: GetAllApartmentsProps) => {
    return useQuery<ApartmentWithRooms[]>({
        queryFn: () => client.apartmentApi.getAllApartments(),
        queryKey: [APARTMENT_QUERY_KEYS.ALL_APARTMENTS],
        enabled: enabled,
    })
}
/** What the name dialog saves: a new apartment, a renamed one, or a new / renamed room of an apartment. */
export type SaveNameTarget =
    | { kind: "apartment"; apartmentId?: number }
    | { kind: "room"; apartmentId: number; roomId?: number };

export const useSaveApartmentOrRoomName = ({onSuccess}: { onSuccess: (createdApartmentId?: number) => void }) => {
    const {showToast} = useToast();
    return useMutation({
        mutationFn: async ({target, name}: { target: SaveNameTarget; name: string }) => {
            const saveNameRequest = {name};
            if ("apartment" === target.kind) {
                if (isNullable(target.apartmentId)) {
                    return (await client.apartmentApi.createApartment({saveNameRequest})).id;
                }
                await client.apartmentApi.renameApartment({id: target.apartmentId, saveNameRequest});
            } else if (isNullable(target.roomId)) {
                await client.apartmentApi.createRoom({id: target.apartmentId, saveNameRequest});
            } else {
                await client.apartmentApi.renameRoom({id: target.apartmentId, roomId: target.roomId, saveNameRequest});
            }
            return undefined;
        },
        onSuccess: async (createdApartmentId) => {
            await queryClient.invalidateQueries({queryKey: [APARTMENT_QUERY_KEYS.ALL_APARTMENTS]});
            showToast('success', 'Zapisano');
            onSuccess(createdApartmentId);
        },
        onError: () => showToast('error', 'Nie udało się zapisać nazwy. Spróbuj ponownie.'),
    });
};

export const useDeleteRoom = () => {
    const {showToast} = useToast();
    return useMutation({
        mutationFn: ({apartmentId, roomId}: { apartmentId: number; roomId: number }) =>
            client.apartmentApi.deleteRoom({id: apartmentId, roomId}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [APARTMENT_QUERY_KEYS.ALL_APARTMENTS]});
            showToast('success', 'Usunięto pokój');
        },
        onError: (error) => {
            const inUse = error instanceof ResponseError && isEqual(409, error.response.status);
            showToast('error', inUse
                ? 'Nie można usunąć pokoju: ma powiązane umowy lub koszty.'
                : 'Nie udało się usunąć pokoju. Spróbuj ponownie.');
        },
    });
};
