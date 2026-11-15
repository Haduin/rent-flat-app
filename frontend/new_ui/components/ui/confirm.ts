import {confirmDialog} from "primereact/confirmdialog";

/** Ask before a destructive action: red confirm button, focus starts on "Anuluj". Rendered by AppShell's ConfirmDialog. */
export const confirmDanger = ({title, message, confirmLabel, onConfirm}: {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
}) =>
    confirmDialog({
        header: title,
        message,
        defaultFocus: "reject",
        acceptLabel: confirmLabel,
        rejectLabel: "Anuluj",
        acceptClassName: "p-button-danger",
        accept: onConfirm,
    });
