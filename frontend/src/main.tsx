import React from "react";
import ReactDOM from 'react-dom/client'
import {RouterProvider} from "react-router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {router} from "./router/router.tsx";
import {OidcProvider} from "./oidc.tsx";

import './index.css'
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import {PrimeReactProvider} from "primereact/api";
import {ToastProvider} from "./components/commons/ToastProvider.tsx";


export const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <OidcProvider
            // fallback={<h1>Initializing OIDC...</h1>}
        >
            <PrimeReactProvider>
                <ToastProvider>
                    <QueryClientProvider client={queryClient}>
                        <RouterProvider router={router}/>
                    </QueryClientProvider>
                </ToastProvider>
            </PrimeReactProvider>
        </OidcProvider>
    </React.StrictMode>
);