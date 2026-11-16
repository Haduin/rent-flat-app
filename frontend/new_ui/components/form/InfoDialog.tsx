import {ReactNode} from "react";
import {Dialog} from "primereact/dialog";
import {Button} from "../ui/Button.tsx";
import {useReturnFocus} from "./useReturnFocus.ts";

/** Read-only dialog (details, history): same widths and phone gutter as FormDialog, one "Zamknij". */
export const InfoDialog = ({visible, title, onHide, size = "sm", children}: {
    visible: boolean;
    title: ReactNode;
    onHide: () => void;
    size?: "sm" | "md";
    children: ReactNode;
}) => {
    useReturnFocus(visible);
    return (
    <Dialog
        visible={visible}
        onHide={onHide}
        header={title}
        className="ku-form-dialog"
        style={{width: "sm" === size ? "28rem" : "36rem"}}
        breakpoints={{"560px": "calc(100vw - 32px)"}}
        footer={
            <div className="ku-form-dialog-footer">
                <Button variant="secondary" type="button" onClick={onHide} autoFocus>Zamknij</Button>
            </div>
        }
    >
        {children}
    </Dialog>
    );
};
