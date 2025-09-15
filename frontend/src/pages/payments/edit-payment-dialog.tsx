import {Payment, Status} from "../../components/commons/types.ts";
import {Modal} from "../../components/modal/modal.tsx";
import {useFormik} from "formik";
import * as Yup from 'yup';
import {TextField} from "../../components/text-field/text-field.tsx";
import {DateSelector} from "../../components/date-selector/date-selector.tsx";
import {ModalFooter} from "../../components/modal/footer/modal-footer.tsx";
import {StatusSelectField} from "../../components/select-option/select-option.tsx";

interface EditPaymentDialogProps {
    isVisible: boolean;
    onHide: () => void;
    onConfirm: () => void;
    selectedPayment: Payment | null;
}

export const EditPaymentDialog = ({
                                      isVisible,
                                      onHide,
                                      onConfirm,
                                      selectedPayment
                                  }: EditPaymentDialogProps) => {


    const formik = useFormik({
        initialValues: {
            payedDate: selectedPayment?.payedDate || null,
            amount: selectedPayment?.amount || null,
            status: selectedPayment?.status || ''
        },
        onSubmit: () => {

        },
        validationSchema: Yup.object().shape({
            payedDate: Yup.date().nullable(),
            amount: Yup.number().nullable(),
            status: Yup.string().nullable(),
        })
    })
    console.log(formik.values);
    console.log(selectedPayment);
    const statusOptions = [
        {label: "Opłacone", value: "PENDING", status: Status.PAID},
        {label: "Oczekujące", value: "PAID", status: Status.PENDING},
        {label: "Spóźnione", value: "LATE", status: Status.LATE},
        {label: "Anulowane", value: "CANCELLED", status: Status.CANCELLED}
    ];

    return (
        <Modal isOpen={isVisible}
               title="Edycja płatoności"
               onClose={onHide}
               content={
                   <form>
                       <DateSelector name="payDate" label="Data wpływu" formik={formik}/>
                       <TextField name="amount" label="Kwota" formik={formik}/>
                       <StatusSelectField
                           name="status"
                           label="Status płatności"
                           formik={formik}
                           options={statusOptions}
                           placeholder="Wybierz status płatności"
                       />

                   </form>
               }
               footer={
                   <ModalFooter
                       cancelLabel="Anuluj"
                       confirmLabel="Edytuj"
                       onConfirm={onConfirm}
                       onCancel={onHide}
                   />
               }
        />

    );
};
