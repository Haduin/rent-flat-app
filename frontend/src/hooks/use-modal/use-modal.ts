import {useState} from "react";
import {useReturnModalFocus} from "../use-return-modal-focus";

type UseModalProps = {
    keepFocus?: boolean;
    returnToLastActive?: boolean;
};

export const useModal = ({
                             keepFocus = true,
                             returnToLastActive = true,
                         }: UseModalProps = {}) => {
    const [open, setOpen] = useState(false);

    const anchorRef = useReturnModalFocus({
        keepFocus,
        returnToLastActive,
        isDisabled: false,
    });

    const closeHandler = () => setOpen(false);

    const openHandler = () => setOpen(true);

    return {
        anchorRef,
        isOpen: open,
        open: openHandler,
        close: closeHandler,
        setOpen,
    };
};
