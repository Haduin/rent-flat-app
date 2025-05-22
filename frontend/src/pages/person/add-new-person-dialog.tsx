import React from 'react';
import {NewPerson} from "./person-table.types.ts";
import {Dialog} from "primereact/dialog";
import {Button} from "primereact/button";
import {useFormik} from "formik";
import * as Yup from 'yup';
import {UseMutationResult} from "@tanstack/react-query";
import {TextField} from "../../components/text-field/text-field.tsx";

interface AddPersonDialogProps {
    visible: boolean;
    onSave: UseMutationResult<void, Error, NewPerson, unknown>
    onHide: () => void;
}

const AddNewPersonDialog: React.FC<AddPersonDialogProps> = ({visible, onSave, onHide}) => {
    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            documentNumber: '',
            nationality: '',
            numer: ''
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('Imię jest wymagane'),
            lastName: Yup.string().required('Nazwisko jest wymagane'),
            documentNumber: Yup.string().required('Numer dokumentu jest wymagany'),
            nationality: Yup.string().required('Narodowość jest wymagana'),
            numer: Yup.string().required('numer jest wymagana'),
        }),
        onSubmit: (values) => {
            onSave.mutate(values, {
                onSuccess: () => {
                    formik.resetForm();
                    onHide();
                }
            });

        },
    });

    return (
        <Dialog
            visible={visible}
            header="Dodaj nowego najemcę"
            modal
            onHide={() => {
                formik.resetForm();
                onHide();
            }}
            footer={
                <div className="flex justify-content-between">
                    <Button
                        label="Anuluj"
                        icon="pi pi-times"
                        className="p-button-text"
                        onClick={() => {
                            formik.resetForm();
                            onHide();
                        }}
                    />
                    <Button
                        label="Zapisz"
                        icon="pi pi-check"
                        className="p-button-text"
                        onClick={() => formik.handleSubmit()}
                    />
                </div>
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
                        <TextField name="numer" label="numer" formik={formik}/>
                    </div>
                </form>
            )}

        </Dialog>
    );
};

export default AddNewPersonDialog;

