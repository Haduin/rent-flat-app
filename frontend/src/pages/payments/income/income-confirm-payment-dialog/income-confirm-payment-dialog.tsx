import {useFormik} from "formik";
import {InputText} from "primereact/inputtext";
import {DateSelector} from "../../../../components/date-selector/date-selector.tsx";
import {Modal} from "../../../../components/modal/modal.tsx";
import {TextField} from "../../../../components/text-field/text-field.tsx";
import {ModalFooter} from "../../../../components/modal/footer/modal-footer.tsx";
import {ConfirmPaymentDialogProps} from "./income-confirm-payment-dialog.props.ts";
import {IncomeConfirmPaymentDialogSchema} from "./income-confirm-payment-dialog.schema.ts";
import {z} from "zod";
import {useMemo} from "react";


export const IncomeConfirmPaymentDialog = ({
                                               isVisible,
                                               onHide,
                                               selectedPayment,
                                               onConfirm
                                           }: ConfirmPaymentDialogProps) => {

    const defaultValues: z.infer<typeof IncomeConfirmPaymentDialogSchema> = useMemo(() => ({
        date: new Date(),
        payedAmount: selectedPayment?.amount ?? null,
        paymentId: selectedPayment?.id ?? null,
    }), [selectedPayment?.amount, selectedPayment?.id])

    const formik = useFormik<z.infer<typeof IncomeConfirmPaymentDialogSchema>>({
        initialValues: defaultValues,
        enableReinitialize: true,
        onSubmit: async (values) => {
            onConfirm(values.date, values.paymentId!!, values.payedAmount || 0);
        }
    })

    if (!isVisible)
        return null;

    return (
        <Modal isOpen={isVisible}
               title="Potwierdz wpłatne najemcy"
               onClose={onHide}
               content={
                   <form>
                       <div className="flex flex-column gap-2">
                           <label className="block text-sm font-medium" htmlFor="username">Imię i nazwisko</label>

                           <InputText disabled
                                      value={`${selectedPayment?.person?.firstName} ${selectedPayment?.person?.lastName}`}
                                      id="username"/>
                       </div>

                       <DateSelector formik={formik} name="date" label="Data wpłaty"/>
                       <TextField name="payedAmount" label="Kwota" formik={formik}/>

                   </form>
               }
               footer={
                   <ModalFooter
                       cancelLabel="Anuluj"
                       confirmLabel="Potwierdz wpłatne"
                       onConfirm={formik.handleSubmit}
                       onCancel={onHide}
                   />
               }
        />
    )
}