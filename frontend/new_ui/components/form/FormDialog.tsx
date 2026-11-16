import {FormEventHandler, ReactNode, useEffect, useRef} from "react";
import {Dialog} from "primereact/dialog";
import {Button} from "../ui/Button.tsx";
import {isNull} from "../../../src/utils/typeguards";
import {useReturnFocus} from "./useReturnFocus.ts";

/** Overlays PrimeReact portals to <body> for fields inside a dialog (calendar, dropdown list). */
const CHILD_OVERLAY_SELECTOR = ".p-datepicker:not(.p-datepicker-inline), .p-dropdown-panel";
const FOCUSABLE_SELECTOR = "input:not([disabled]):not([type=hidden]), textarea:not([disabled]), [role=combobox]:not([aria-disabled=true]), button:not([disabled])";

const WIDTH = {sm: "28rem", md: "36rem"} as const;

export interface FormDialogProps {
    visible: boolean;
    title: ReactNode;
    onHide: () => void;
    /** Ties the footer's submit button to the form, so Enter in any field submits too. */
    formId: string;
    onSubmit: FormEventHandler<HTMLFormElement>;
    submitLabel: string;
    /** "danger" for actions that end or remove something. */
    submitVariant?: "primary" | "danger";
    saving?: boolean;
    size?: keyof typeof WIDTH;
    children: ReactNode;
}

/**
 * The one dialog shell for new_ui forms: sized for its content (full width minus a gutter on phones),
 * focus on the first field when it opens and back on the opener when it closes, Tab kept inside,
 * Esc closing an open calendar/dropdown before the dialog, a real <form> so Enter submits.
 */
export const FormDialog = ({
                               visible, title, onHide, formId, onSubmit, submitLabel,
                               submitVariant = "primary", saving = false, size = "sm", children,
                           }: FormDialogProps) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!visible) return;
        const keepFocusInside = (event: FocusEvent) => {
            const dialog = contentRef.current?.closest(".p-dialog");
            const target = event.target as HTMLElement | null;
            if (isNull(target) || !dialog || dialog.contains(target) || target.closest(CHILD_OVERLAY_SELECTOR)) return;
            dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
        };
        document.addEventListener("focusin", keepFocusInside);

        return () => document.removeEventListener("focusin", keepFocusInside);
    }, [visible]);
    useReturnFocus(visible);

    const hideUnlessChildOverlayOpen = () => {
        if (document.querySelector(CHILD_OVERLAY_SELECTOR)) return;
        onHide();
    };

    return (
        <Dialog
            visible={visible}
            onHide={hideUnlessChildOverlayOpen}
            header={title}
            className="ku-form-dialog"
            style={{width: WIDTH[size]}}
            breakpoints={{"560px": "calc(100vw - 32px)"}}
            onShow={() => contentRef.current?.querySelector<HTMLElement>(`#${formId} ${FOCUSABLE_SELECTOR}`)?.focus()}
            footer={
                <div className="ku-form-dialog-footer">
                    <Button variant="secondary" type="button" onClick={onHide}>Anuluj</Button>
                    <Button
                        variant={submitVariant}
                        type="submit"
                        form={formId}
                        loading={saving}
                        disabled={saving}
                    >
                        {submitLabel}
                    </Button>
                </div>
            }
        >
            <div ref={contentRef}>
                <form id={formId} onSubmit={onSubmit} noValidate className="ku-form">
                    {children}
                </form>
            </div>
        </Dialog>
    );
};
