import './App.css'
import {MyRoutes} from "./routes/MyRoutes.tsx";
import 'primereact/resources/themes/lara-light-indigo/theme.css'; //theme
import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css';
import {addLocale} from "primereact/api";
import {createContext, useEffect, useState} from "react";
import Keycloak from "keycloak-js";

addLocale("pl", {
    firstDayOfWeek: 1,
    dayNames: [
        "Niedziela",
        "Poniedziałek",
        "Wtorek",
        "Środa",
        "Czwartek",
        "Piątek",
        "Sobota",
    ],
    dayNamesShort: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
    dayNamesMin: ["N", "P", "W", "Ś", "C", "P", "S"],
    monthNames: [
        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień",
    ],
    monthNamesShort: [
        "Sty",
        "Lut",
        "Mar",
        "Kwi",
        "Maj",
        "Cze",
        "Lip",
        "Sie",
        "Wrz",
        "Paź",
        "Lis",
        "Gru",
    ],
    today: "Dziś",
    clear: "Wyczyść",
});

const initOptiosn = {
    realm: 'mieszkania_realm',
    url: 'http://localhost:8081/',
    clientId: 'mieszkanie_client_id'
};
export const keycloak = new Keycloak(initOptiosn);

keycloak.init({
    onLoad: 'check-sso', // Supported values: 'check-sso' , 'login-required'
    checkLoginIframe: false,
    pkceMethod: 'S256'
}).then((auth) => {
    if (!auth) {
        window.location.reload();
    } else {
        localStorage.setItem('token', keycloak.token);

        // apiClient.interceptors.request.use(
        //     async (config) => {
        //         if (keycloak.authenticated && keycloak.token) {
        //             console.log('token', "ASDSASADSASA");
        //             config.headers.Authorization = `Bearer ${keycloak.token}`;
        //         }
        //         return config;
        //     },
        //     (error) => Promise.reject(error)
        // );

        setupTokenRefresh()

        keycloak.onTokenExpired = () => {
            console.log('token expired');
        };
    }
}, () => {
    /* Notify the user if necessary */
    console.error('Authentication Failed');
});

const setupTokenRefresh = () => {
    setInterval(async () => {
        try {
            const refreshed = await keycloak.updateToken(30); // Odśwież token 30s przed wygaśnięciem
            if (refreshed) {
                console.log("Token refreshed");
            } else {
                console.warn("Token not refreshed");
            }
        } catch (error) {
            console.error("Failed to refresh token", error);
        }
    }, 60000); // Co 60s sprawdzamy, czy trzeba odświeżyć token
};


export const KeyClockContext = createContext({} as Keycloak)


const App = () => {

    const [keycloakState, setKeycloakState] = useState<Keycloak>();
    useEffect(() => {
        setKeycloakState(keycloak);
    }, [keycloak]);

    return (
        // @ts-ignore
        <KeyClockContext.Provider value={keycloakState}>
            <MyRoutes/>
        </KeyClockContext.Provider>
    )
}

export default App
