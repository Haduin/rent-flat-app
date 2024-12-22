import {createContext, ReactNode, useContext, useRef} from 'react';
import {Toast} from 'primereact/toast';
import {ConfirmDialog} from "primereact/confirmdialog";

const ToastContext = createContext<ToastContextType>({
    showToast: () => {
    }
});


interface ToastContextType {
    showToast: (
        severity: Severity,
        summary?: ReactNode,
        detail?: ReactNode,
        life?: number
    ) => void;
}

type Severity = 'success' | 'info' | 'warn' | 'error'

export const ToastProvider = ({children}: any) => {

    const toastRef = useRef(null);
    const showMessage = (severity: Severity, summary: ReactNode, detail?: ReactNode, life?: number) => {
        // @ts-ignore
        toastRef.current.show({severity, summary, detail, life});
    }
    return (
        <ToastContext.Provider value={{
            showToast: showMessage
        }}>
            <Toast ref={toastRef}/>
            <ConfirmDialog/>
            {children}
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const showToast = useContext(ToastContext);
    if (!showToast) {
        throw new Error('useToast musi być używany wewnątrz ToastProvider!');
    }
    return showToast;
};