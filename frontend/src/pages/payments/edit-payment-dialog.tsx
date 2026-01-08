import {EditPayment, Payment, Status} from "../../components/commons/types.ts";
import {Modal} from "../../components/modal/modal.tsx";
import {useFormik} from "formik";
import * as Yup from 'yup';
import {TextField} from "../../components/text-field/text-field.tsx";
import {DateSelector} from "../../components/date-selector/date-selector.tsx";
import {ModalFooter} from "../../components/modal/footer/modal-footer.tsx";
import {StatusSelectField} from "../../components/select-option/select-option.tsx";
import {dateToStringFullYearMouthDay} from "../../components/commons/dateFormatter.ts";
import {useMemo} from "react";

interface EditPaymentDialogProps {
    isVisible: boolean;
    onHide: () => void;
    onConfirm: (payment: EditPayment) => Promise<void>;
    selectedPayment: Payment | null;
}

export const EditPaymentDialog = ({
                                      isVisible,
                                      onHide,
                                      onConfirm,
                                      selectedPayment
                                  }: EditPaymentDialogProps) => {


    const defaultValues = useMemo(() => ({
        payedDate: selectedPayment?.payedDate ? new Date(selectedPayment.payedDate) : new Date(),
        amount: selectedPayment?.amount,
        status: selectedPayment?.status
    }), [selectedPayment?.amount, selectedPayment?.payedDate, selectedPayment?.status])

    const formik = useFormik({
        initialValues: defaultValues,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const request = {
                paymentId: selectedPayment?.id,
                payedDate: dateToStringFullYearMouthDay(values?.payedDate),
                amount: values.amount,
                status: values.status,
            } as EditPayment;
            await onConfirm(request)
        },
        validationSchema: Yup.object().shape({
            payedDate: Yup.date().nullable(),
            amount: Yup.number().nullable(),
            status: Yup.string().nullable(),
        })
    })

    const statusOptions = [
        {label: "Opłacone", value: "PAID", status: Status.PAID},
        {label: "Oczekujące", value: "PENDING", status: Status.PENDING},
        {label: "Spóźnione", value: "LATE", status: Status.LATE},
        {label: "Anulowane", value: "CANCELLED", status: Status.CANCELLED}
    ];

    if (!isVisible)
        return null;

    return (
        <Modal isOpen={isVisible}
               title="Edycja płatoności"
               onClose={onHide}
               content={
                   <form>
                       <DateSelector name="payedDate" label="Data wpływu" formik={formik}/>
                       <TextField name="amount" label="Kwota" formik={formik} inputType="number"/>
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
                       onConfirm={formik.handleSubmit}
                       onCancel={onHide}
                   />
               }
        />

    );
};
