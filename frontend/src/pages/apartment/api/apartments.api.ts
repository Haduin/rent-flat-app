import {useQuery} from "@tanstack/react-query"
import {APARTMENT_QUERY_KEYS} from "../../../api/keys/apartment.ts";
import {client} from "../../../api/client.ts";
import type {ApartmentWithRooms} from "../../../api/generated";
import {GetAllApartmentsProps} from "./apartments.api.props.ts";

export const getApartments = ({
                                  enabled,
                              }: GetAllApartmentsProps) => {
    return useQuery<ApartmentWithRooms[]>({
        queryFn: () => client.apartmentApi.getAllApartments(),
        queryKey: [APARTMENT_QUERY_KEYS.ALL_APARTMENTS],
        enabled: enabled,
    })
}