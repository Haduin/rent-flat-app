import React from "react";

export interface ModalProps {
    isOpen: boolean;
    title: string;
    content?: React.ReactElement;
    footer?: React.ReactElement;
    onClose: () => void;
}