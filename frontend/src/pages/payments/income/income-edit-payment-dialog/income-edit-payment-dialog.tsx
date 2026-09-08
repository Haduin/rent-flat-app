import {EditPayment} from "../../../../components/commons/types.ts";
import {Modal} from "../../../../components/modal/modal.tsx";
import {useFormik} from "formik";
import * as Yup from 'yup';
import {TextField} from "../../../../components/text-field/text-field.tsx";
import {DateSelector} from "../../../../components/date-selector/date-selector.tsx";
import {ModalFooter} from "../../../../components/modal/footer/modal-footer.tsx";
import {StatusSelectField} from "../../../../components/select-option/select-option.tsx";
import {dateToStringFullYearMouthDay} from "../../../../components/commons/dateFormatter.ts";
import {useMemo} from "react";
import {PaymentStatus} from "../../../../api/generated";
import {EditPaymentDialogProps} from "./income-edit-payment-dialog.props.ts";
import {useGetPaymentSplits} from "../api/income-payments-view.api.ts";


export const IncomeEditPaymentDialog = ({
                                            isVisible,
                                            onHide,
                                            onConfirm,
                                            selectedPayment
                                        }: EditPaymentDialogProps) => {

    const {data: splits} = useGetPaymentSplits(selectedPayment?.id);
    const paidSoFar = useMemo(
        () => (splits ?? []).reduce((sum, split) => sum + split.amount, 0),
        [splits]
    );

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
        {label: "Opłacone", value: "PAID", status: PaymentStatus.Paid},
        {label: "Oczekujące", value: "PENDING", status: PaymentStatus.Pending},
        {label: "Spóźnione", value: "LATE", status: PaymentStatus.Late},
        {label: "Anulowane", value: "CANCELLED", status: PaymentStatus.Cancelled},
        {label: "Częściowo opłacone", value: "PARTIALLY_PAID", status: PaymentStatus.PartiallyPaid}
    ];

    if (!isVisible)
        return null;

    return (
        <Modal isOpen={isVisible}
               title="Edycja płatoności"
               onClose={onHide}
               content={
                   <form>
                       {splits && splits.length > 0 && (
                           <div className="flex flex-column gap-1 mb-3">
                               <span className="text-sm font-medium">Historia wpłat częściowych</span>
                               {splits.map((split) => (
                                   <div key={split.id} className="text-sm">
                                       {split.paymentDate} — {split.amount}
                                   </div>
                               ))}
                               <span className="text-sm font-medium mt-1">
                                   Wpłacono łącznie: {paidSoFar} / {selectedPayment?.amount}
                               </span>
                           </div>
                       )}

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
