import {useFormik} from "formik";
import {InputText} from "primereact/inputtext";
import {DateSelector} from "../../../../components/date-selector/date-selector.tsx";
import {Modal} from "../../../../components/modal/modal.tsx";
import {TextField} from "../../../../components/text-field/text-field.tsx";
import {ModalFooter} from "../../../../components/modal/footer/modal-footer.tsx";
import {SplitPaymentDialogProps} from "./income-split-payment-dialog.props.ts";
import {IncomeSplitPaymentDialogSchema} from "./income-split-payment-dialog.schema.ts";
import {z} from "zod";
import {useMemo} from "react";
import {useGetPaymentSplits} from "../api/income-payments-view.api.ts";

export const IncomeSplitPaymentDialog = ({
                                              isVisible,
                                              onHide,
                                              selectedPayment,
                                              onConfirm
                                          }: SplitPaymentDialogProps) => {

    const {data: splits} = useGetPaymentSplits(selectedPayment?.id);

    const alreadyPaid = useMemo(
        () => (splits ?? []).reduce((sum, split) => sum + split.amount, 0),
        [splits]
    );
    const remaining = (selectedPayment?.amount ?? 0) - alreadyPaid;

    const defaultValues: z.infer<typeof IncomeSplitPaymentDialogSchema> = useMemo(() => ({
        date: new Date(),
        amount: remaining > 0 ? remaining : null,
        paymentId: selectedPayment?.id ?? null,
    }), [remaining, selectedPayment?.id])

    const formik = useFormik<z.infer<typeof IncomeSplitPaymentDialogSchema>>({
        initialValues: defaultValues,
        enableReinitialize: true,
        onSubmit: async (values) => {
            onConfirm(values.date, values.paymentId!, values.amount || 0);
        }
    })

    if (!isVisible)
        return null;

    return (
        <Modal isOpen={isVisible}
               title="Podziel płatność"
               onClose={onHide}
               content={
                   <form>
                       <div className="flex flex-column gap-2">
                           <label className="block text-sm font-medium" htmlFor="username">Imię i nazwisko</label>

                           <InputText disabled
                                      value={`${selectedPayment?.person?.firstName} ${selectedPayment?.person?.lastName}`}
                                      id="username"/>
                       </div>

                       <div className="flex flex-column gap-2 mt-2">
                           <span>Kwota należna: {selectedPayment?.amount}</span>
                           <span>Wpłacono dotychczas: {alreadyPaid}</span>
                           <span>Pozostało do zapłaty: {remaining}</span>
                       </div>

                       {splits && splits.length > 0 && (
                           <div className="flex flex-column gap-1 mt-2">
                               <span className="text-sm font-medium">Historia wpłat częściowych</span>
                               {splits.map((split) => (
                                   <div key={split.id} className="text-sm">
                                       {split.paymentDate} — {split.amount}
                                   </div>
                               ))}
                           </div>
                       )}

                       <div className="mt-2">
                           <DateSelector formik={formik} name="date" label="Data wpłaty"/>
                           <TextField name="amount" label="Kwota wpłaty" formik={formik} inputType="number"/>
                       </div>
                   </form>
               }
               footer={
                   <ModalFooter
                       cancelLabel="Anuluj"
                       confirmLabel="Zapisz wpłatę"
                       onConfirm={formik.handleSubmit}
                       onCancel={onHide}
                   />
               }
        />
    )
}
