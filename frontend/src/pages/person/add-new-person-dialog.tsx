import React from 'react';
import {NewPerson} from "./person-table.types.ts";
import {useFormik} from "formik";
import * as Yup from 'yup';
import {UseMutationResult} from "@tanstack/react-query";
import {TextField} from "../../components/text-field/text-field.tsx";
import {Modal} from "../../components/modal/modal.tsx";
import {ModalFooter} from "../../components/modal/footer/modal-footer.tsx";

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

    const handleOnClose = () => {
        formik.resetForm();
        onHide();
    }

    return (
        <Modal isOpen={visible}
               title="Dodaj nowego najemce"
               onClose={handleOnClose}
               content={onSave.isPending ? (
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
               footer={
                   <ModalFooter
                       cancelLabel="Anuluj"
                       confirmLabel="Zapisz"
                       onConfirm={formik.handleSubmit}
                       onCancel={handleOnClose}
                   />
               }
        />
    )
};

export default AddNewPersonDialog;

