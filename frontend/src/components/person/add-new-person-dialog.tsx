import React from 'react';
import {NewPerson} from "./person-table.types.ts";
import {Dialog} from "primereact/dialog";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {useFormik} from "formik";
import * as Yup from 'yup';
import {UseMutationResult} from "@tanstack/react-query";

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
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('Imię jest wymagane'),
            lastName: Yup.string().required('Nazwisko jest wymagane'),
            documentNumber: Yup.string().required('Numer dokumentu jest wymagany'),
            nationality: Yup.string().required('Narodowość jest wymagana'),
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
                <div>
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
                        <div className="field">
                            <label htmlFor="firstName">Imię</label>
                            <InputText
                                id="firstName"
                                name="firstName"
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={formik.touched.firstName && formik.errors.firstName ? 'p-invalid' : ''}
                            />
                            {formik.touched.firstName && formik.errors.firstName && (
                                <small className="p-error">{formik.errors.firstName}</small>
                            )}
                        </div>
                        <div className="field">
                            <label htmlFor="lastName">Nazwisko</label>
                            <InputText
                                id="lastName"
                                name="lastName"
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={formik.touched.lastName && formik.errors.lastName ? 'p-invalid' : ''}
                            />
                            {formik.touched.lastName && formik.errors.lastName && (
                                <small className="p-error">{formik.errors.lastName}</small>
                            )}
                        </div>
                        <div className="field">
                            <label htmlFor="documentNumber">Numer Dokumentu</label>
                            <InputText
                                id="documentNumber"
                                name="documentNumber"
                                value={formik.values.documentNumber}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={formik.touched.documentNumber && formik.errors.documentNumber ? 'p-invalid' : ''}
                            />
                            {formik.touched.documentNumber && formik.errors.documentNumber && (
                                <small className="p-error">{formik.errors.documentNumber}</small>
                            )}
                        </div>
                        <div className="field">
                            <label htmlFor="nationality">Narodowość</label>
                            <InputText
                                id="nationality"
                                name="nationality"
                                value={formik.values.nationality}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={formik.touched.nationality && formik.errors.nationality ? 'p-invalid' : ''}
                            />
                            {formik.touched.nationality && formik.errors.nationality && (
                                <small className="p-error">{formik.errors.nationality}</small>
                            )}
                        </div>
                    </div>
                </form>
            )}

        </Dialog>
    );
};

export default AddNewPersonDialog;

