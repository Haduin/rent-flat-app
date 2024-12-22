import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router";
import {PrimeReactProvider} from "primereact/api";

import "primereact/resources/themes/lara-light-cyan/theme.css";
import {ToastProvider} from "./components/commons/ToastProvider.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <PrimeReactProvider>
                <ToastProvider>
                    <App/>
                </ToastProvider>
            </PrimeReactProvider>
        </BrowserRouter>
    </StrictMode>
)
