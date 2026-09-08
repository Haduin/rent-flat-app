import {Modal} from "../modal/modal.tsx";
import {ModalFooter} from "../modal/footer/modal-footer.tsx";
import {ConfirmationDialogProps} from "./confirmation-dialog.props.ts";

export const ConfirmationDialog = ({
                                       title,
                                       isOpen,
                                       onClose,
                                       onConfirm,
                                       confirmLabel,
                                       cancelLabel,
                                   }: ConfirmationDialogProps) => {
    return (
        <Modal
            title={title}
            isOpen={isOpen}
            onClose={onClose}
            footer={
                <ModalFooter
                    cancelLabel={cancelLabel}
                    confirmLabel={confirmLabel}
                    onConfirm={onConfirm}
                    onCancel={onClose}
                />
            }
        />
    )
}