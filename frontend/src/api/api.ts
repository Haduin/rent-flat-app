import axios from "axios";
import {getOidc} from "../oidc.tsx";
import {personsApi} from "./persons.api.ts";
import {apartmentsApi} from "./apartments.api.ts";
import {paymentsApi} from "./payments.api.ts";
import {contractsApi} from "./contracts.api.ts";
import {dashboardApi} from "./dashboard.api.ts";

type Api = {
    apartmentsApi: typeof apartmentsApi
    personsApi: typeof personsApi
    paymentsApi: typeof paymentsApi
    contractsApi: typeof contractsApi
    dashboardApi: typeof dashboardApi
};

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,

    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

axiosInstance.interceptors.request.use(async config => {

    const oidc = await getOidc();

    if (!oidc.isUserLoggedIn) {
        throw new Error("We made a logic error: The user should be logged in at this point");
    }

    const {accessToken} = await oidc.getTokens();

    config.headers.Authorization = `Bearer ${accessToken}`;

    return config;

})

export const api: Api = {
    apartmentsApi: apartmentsApi,
    personsApi: personsApi,
    paymentsApi: paymentsApi,
    contractsApi: contractsApi,
    dashboardApi: dashboardApi
};
