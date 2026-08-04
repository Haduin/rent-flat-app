import * as Yup from 'yup';
import {useFormik} from "formik";
import {TextField} from "../../../components/text-field/text-field.tsx";
import {Modal} from "../../../components/modal/modal.tsx";
import {ModalFooter} from "../../../components/modal/footer/modal-footer.tsx";
import {EditPersonDialogProps} from "./add-new-person-dialog.props.ts";


const EditPersonDialog = ({person, visible, onSave, onHide}: EditPersonDialogProps) => {
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
    const handleOnClose = () => {
        formik.resetForm();
        onHide();
    }

    return (
        <Modal
            isOpen={visible}
            title="Edytuj najemcę"
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
                    </div>
                </form>
            )}
            footer={
                <ModalFooter onConfirm={formik.handleSubmit}
                             onCancel={handleOnClose}
                             confirmLabel="Zapisz"
                             cancelLabel="Anuluj"
                />
            }
        />
    );
};

export default EditPersonDialog;