import {useFormik} from "formik";
import * as Yup from 'yup';
import {TextField} from "../../components/text-field/text-field.tsx";
import {CheckboxField} from "../../components/checkbox/checkbox.tsx";
import {DateSelector} from "../../components/date-selector/date-selector.tsx";
import {dateToStringFullYearMouthDay} from "../../components/commons/dateFormatter.ts";
import {DeleteContractFormikValues, DisableContractModalProps} from "./contract.types.ts";
import {Modal} from "../../components/modal/modal.tsx";
import {ModalFooter} from "../../components/modal/footer/modal-footer.tsx";


export const DeleteContractModal = ({isVisible, onHide, selectedContract, onConfirm}: DisableContractModalProps) => {

    const formik = useFormik<DeleteContractFormikValues>({
        initialValues: {
            contractId: Number(selectedContract?.id),
            description: '',
            terminationDate: new Date(),
            depositReturned: false,
            positiveCancel: false,
        },
        validationSchema: Yup.object().shape({
            description: Yup.string(),
            terminationDate: Yup.date().nullable().required("Data zakończenia jest wymagana"),
            depositReturned: Yup.boolean(),
            positiveCancel: Yup.boolean(),
        }),
        enableReinitialize: true,
        onSubmit: (values) => {
            onConfirm.mutate({
                details: {
                    contractId: values.contractId,
                    depositReturned: values.depositReturned,
                    terminationDate: dateToStringFullYearMouthDay(values.terminationDate),
                    description: values.description,
                    positiveCancel: values.positiveCancel
                }
            });
        }
    })

    return (
        <Modal isOpen={isVisible} onClose={onHide} title="Czy chcesz zakończyć kontrakt?"
               content={
                   <div className="m-4">
                       <DateSelector name="terminationDate" label="Data zakończenia kontraktu" formik={formik}/>
                       <TextField name="description" label="Opis" formik={formik}/>
                       <div className="flex justify-content-between">
                           <CheckboxField name="depositReturned" label="Kaucja zwrócona" formik={formik}/>
                           <CheckboxField name="positiveCancel" label="Zakończono polubownie" formik={formik}/>
                       </div>
                   </div>
               }
               footer={
                   <ModalFooter
                       cancelLabel="Anuluj"
                       confirmLabel="Zatwierdź"
                       onConfirm={formik.handleSubmit}
                       onCancel={onHide}
                   />
               }/>
    )
}