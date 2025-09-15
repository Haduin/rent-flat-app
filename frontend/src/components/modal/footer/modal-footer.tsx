import React from "react";
import {Button} from "primereact/button";

export interface ModalFooterProps {
    onCancel: () => void;
    onConfirm?: (() => void) | React.FormEventHandler<HTMLElement>;
    cancelLabel?: string;
    confirmLabel?: string;
    confirmButtonDisabled?: boolean;
    cancelButtonDisabled?: boolean;
}

export const ModalFooter = ({
                                onCancel,
                                onConfirm,
                                cancelLabel,
                                confirmLabel,
                                confirmButtonDisabled,
                                cancelButtonDisabled,
                            }: ModalFooterProps) => (
    <div className="flex justify-content-between gap-2">
        <Button
            disabled={cancelButtonDisabled}
            onClick={onCancel}
            severity="secondary"
        >
            {cancelLabel ?? "Nie"}
        </Button>
        {onConfirm && (
            <Button
                severity="success"
                disabled={confirmButtonDisabled}
                onClick={onConfirm}
            >
                {confirmLabel ?? "Tak"}
            </Button>
        )}
    </div>
);
