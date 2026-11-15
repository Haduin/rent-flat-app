import {useFormik} from "formik";
import * as Yup from "yup";
import {FormDialog} from "../../components/form/FormDialog.tsx";
import {TextField} from "../../components/form/fields.tsx";

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

    return (
        <FormDialog
            visible={visible}
            title={title}
            onHide={onHide}
            formId="name-form"
            onSubmit={formik.handleSubmit}
            submitLabel="Zapisz"
            saving={saving}
        >
            <TextField formik={formik} name="name" label={label}/>
        </FormDialog>
    );
};
