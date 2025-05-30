import React from 'react';
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {Person} from "./person-table.types.ts";
import * as Yup from 'yup';
import {useFormik} from "formik";
import {UseMutationResult} from "@tanstack/react-query";
import {TextField} from "../../components/text-field/text-field.tsx";

interface EditPersonDialogProps {
    person: Person | null;
    visible: boolean;
    onSave: UseMutationResult<Person, Error, Person, unknown>
    onHide: () => void;
}

const EditPersonDialog: React.FC<EditPersonDialogProps> = ({person, visible, onSave, onHide}) => {
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: person || {
            id: '',
            firstName: '',
            lastName: '',
            documentNumber: '',
            nationality: '',
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('Imię jest wymagane'),
            lastName: Yup.string().required('Nazwisko jest wymagane'),
            documentNumber: Yup.string().required('Numer dokumentu jest wymagany'),
            nationality: Yup.string().required('Narodowość jest wymagana'),
        }),
        onSubmit: (values) => {
            console.log(values);
            //@ts-ignore
            onSave.mutate(values, {
                onSuccess: () => {
                    onHide();
                },
            });
        },
    });

    return (
        <Dialog
            visible={visible}
            header="Edytuj najemcę"
            modal
            onHide={() => {
                onHide();
                formik.resetForm();
            }}
            footer={
                // @ts-ignore
                !onSave.isLoading && (
                    <div>
                        <Button
                            label="Anuluj"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => {
                                onHide();
                                formik.resetForm();
                            }}
                        />
                        <Button
                            label="Zapisz"
                            icon="pi pi-check"
                            className="p-button-text"
                            onClick={() => formik.handleSubmit()}
                        />
                    </div>
                )
            }
        >
            {onSave.isPending ? (
                <div className="flex justify-content-center align-items-center" style={{height: '200px'}}>
                    <i className="pi pi-spin pi-spinner" style={{fontSize: '3rem'}}></i>
                </div>
            ) : (
                <form>
                    <div className="p-fluid">
                        <TextField name="firstName" label="Imię" formik={formik}/>
                        <TextField name="lastName" label="Nazwisko" formik={formik}/>
                        <TextField name="documentNumber" label="Numer dokumentu" formik={formik}/>
                        <TextField name="nationality" label="Narodowość" formik={formik}/>
                    </div>
                </form>
            )}
        </Dialog>
    );
};

export default EditPersonDialog;