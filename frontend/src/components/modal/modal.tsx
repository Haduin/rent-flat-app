import {ModalProps} from "./modal.types.ts";
import {Dialog} from "primereact/dialog";
import {ModalFooter} from "./footer/modal-footer.tsx";

export const Modal = ({isOpen, title, content, footer, onClose}: ModalProps) => {

    const getFooter = () => {
        if (footer) {
            return footer;
        }

        return (
            <ModalFooter
                cancelLabel="Zamknij"
                onCancel={onClose}
            />
        );
    };

    return (
        <Dialog
            className="card flex justify-content-center"
            style={{
                width: '50vw',
                maxWidth: '100%',
                height: 'auto'
            }}
            onHide={onClose}
            breakpoints={{'960px': '100vw'}}
            header={title}
            visible={isOpen}
            footer={
                getFooter()
            }
        >
            {content}
        </Dialog>
    );
};

