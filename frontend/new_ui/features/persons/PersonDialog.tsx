import {useFormik} from "formik";
import * as Yup from "yup";
import {FormDialog} from "../../components/form/FormDialog.tsx";
import {TextField} from "../../components/form/fields.tsx";
import type {NewPerson, Person} from "../../../src/pages/person/person-table/person-table.types.ts";
import {isNull} from "../../../src/utils/typeguards";

const requiredText = (message: string) => Yup.string().trim().required(message).max(255, "Maksymalnie 255 znaków");

const schema = Yup.object({
    firstName: requiredText("Imię jest wymagane"),
    lastName: requiredText("Nazwisko jest wymagane"),
    documentNumber: requiredText("Numer dokumentu jest wymagany"),
    nationality: requiredText("Narodowość jest wymagana"),
});

const trimmed = (values: NewPerson): NewPerson => ({
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    documentNumber: values.documentNumber.trim(),
    nationality: values.nationality.trim(),
});

/** `person` null → new person. The caller closes the dialog from the mutation's onSuccess. */
export const PersonDialog = ({person, saving, onSave, onHide}: {
    person: Person | null;
    saving: boolean;
    onSave: (values: NewPerson) => void;
    onHide: () => void;
}) => {
    const formik = useFormik<NewPerson>({
        initialValues: {
            firstName: person?.firstName ?? "",
            lastName: person?.lastName ?? "",
            documentNumber: person?.documentNumber ?? "",
            nationality: person?.nationality ?? "",
        },
        validationSchema: schema,
        onSubmit: (values) => onSave(trimmed(values)),
    });

    return (
        <FormDialog
            visible
            title={isNull(person) ? "Nowa osoba" : `Edytuj dane – ${person.firstName} ${person.lastName}`}
            onHide={onHide}
            formId="person-form"
            onSubmit={formik.handleSubmit}
            submitLabel={isNull(person) ? "Dodaj osobę" : "Zapisz zmiany"}
            saving={saving}
        >
            <div className="ku-form-row">
                <TextField formik={formik} name="firstName" label="Imię" autoComplete="given-name"/>
                <TextField formik={formik} name="lastName" label="Nazwisko" autoComplete="family-name"/>
            </div>
            <TextField formik={formik} name="documentNumber" label="Numer dokumentu" hint="Dowód osobisty, paszport lub karta pobytu"/>
            <TextField formik={formik} name="nationality" label="Narodowość"/>
        </FormDialog>
    );
};
