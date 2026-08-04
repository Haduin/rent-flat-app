export interface ConfirmationDialogProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    confirmLabel: string;
    cancelLabel: string;
}