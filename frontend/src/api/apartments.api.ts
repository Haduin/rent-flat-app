import {ApartmentWithRoomsNumber} from "../components/apartment/apartment.types.ts";
import {axiosInstance} from "./api.ts";

export const apartmentsApi: ApartmentApi = {
    getApartments: () => axiosInstance.get("/apartments").then(response => response.data)
}

export type ApartmentApi = {
    getApartments: () => Promise<ApartmentWithRoomsNumber[]>
};