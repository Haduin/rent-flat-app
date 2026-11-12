import {useFormik} from "formik";
import * as Yup from "yup";
import {Dialog} from "primereact/dialog";
import {InputText} from "primereact/inputtext";
import {Button} from "../../components/ui/Button.tsx";

const NAME_MAX_LENGTH = 255;

const nameSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required("Nazwa jest wymagana")
        .max(NAME_MAX_LENGTH, `Nazwa może mieć najwyżej ${NAME_MAX_LENGTH} znaków`),
});

export interface NameDialogProps {
    visible: boolean;
    title: string;
    label: string;
    initialName: string;
    saving: boolean;
    onSave: (name: string) => void;
    onHide: () => void;
}

/** Create-or-rename dialog for an apartment or a room — both are just a name. */
export const NameDialog = ({visible, title, label, initialName, saving, onSave, onHide}: NameDialogProps) => {
    const formik = useFormik({
        initialValues: {name: initialName},
        enableReinitialize: true,
        validationSchema: nameSchema,
        onSubmit: (values) => onSave(values.name.trim()),
    });
    const error = formik.touched.name ? formik.errors.name : undefined;

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={title}
            style={{width: "28rem"}}
            breakpoints={{"560px": "calc(100vw - 32px)"}}
            onShow={() => document.getElementById("apartment-name-input")?.focus()}
            footer={
                <div style={{display: "flex", justifyContent: "flex-end", gap: 8}}>
                    <Button variant="secondary" type="button" onClick={onHide}>Anuluj</Button>
                    <Button type="submit" form="apartment-name-form" loading={saving}>Zapisz</Button>
                </div>
            }
        >
            <form id="apartment-name-form" onSubmit={formik.handleSubmit} noValidate>
                <label htmlFor="apartment-name-input" style={{display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6}}>
                    {label}
                </label>
                <InputText
                    id="apartment-name-input"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={Boolean(error)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "apartment-name-error" : undefined}
                    style={{width: "100%"}}
                />
                {error && (
                    <small id="apartment-name-error" className="p-error" style={{display: "block", marginTop: 6}}>
                        {error}
                    </small>
                )}
            </form>
        </Dialog>
    );
};
