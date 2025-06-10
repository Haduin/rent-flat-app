import { axiosInstance } from "./api.ts";
import { AddUtilityCost, UtilityCost } from "../pages/utility/utility.types.ts";

export const utilitiesApi: UtilitiesApi = {
    getUtilityCosts: (apartmentId: number) => 
        axiosInstance.get(`/utility-costs/${apartmentId}`).then(response => response.data),
    addUtilityCost: (utilityCost: AddUtilityCost) => 
        axiosInstance.post("/utility-costs", utilityCost).then(response => response.data)
}

export type UtilitiesApi = {
    getUtilityCosts: (apartmentId: number) => Promise<UtilityCost[]>;
    addUtilityCost: (utilityCost: AddUtilityCost) => Promise<void>;
};