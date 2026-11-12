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
import {isNullable} from "../../../../utils/typeguards";

/** Today when the payment's month ("YYYY-MM") is the current one; otherwise the 1st of that month, so catching up on old months doesn't stamp today's date. */
const defaultPaymentDate = (scopeDate?: string | null) => {
    const today = new Date();
    if (isNullable(scopeDate)) return today;
    const [year, month] = scopeDate.split("-").map(Number);
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
    return isCurrentMonth ? today : new Date(year, month - 1, 1);
};

const scopeMonthLabel = (scopeDate?: string | null) => {
    if (isNullable(scopeDate)) return "";
    const [year, month] = scopeDate.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString("pl-PL", {month: "long", year: "numeric"});
};


export const IncomeConfirmPaymentDialog = ({
                                               isVisible,
                                               onHide,
                                               selectedPayment,
                                               onConfirm
                                           }: ConfirmPaymentDialogProps) => {

    const defaultValues: z.infer<typeof IncomeConfirmPaymentDialogSchema> = useMemo(() => ({
        date: defaultPaymentDate(selectedPayment?.scopeDate),
        payedAmount: selectedPayment?.amount ?? null,
        paymentId: selectedPayment?.id ?? null,
    }), [selectedPayment?.amount, selectedPayment?.id, selectedPayment?.scopeDate])

    const formik = useFormik<z.infer<typeof IncomeConfirmPaymentDialogSchema>>({
        initialValues: defaultValues,
        enableReinitialize: true,
        validate: (values) => {
            const amount = Number(values.payedAmount);
            return Number.isFinite(amount) && amount > 0 ? {} : {payedAmount: "Kwota musi być liczbą większą od 0"};
        },
        onSubmit: async (values) => {
            onConfirm(values.date, values.paymentId!!, Number(values.payedAmount));
        }
    })

    if (!isVisible)
        return null;

    return (
        <Modal isOpen={isVisible}
               title={`Potwierdź wpłatę za ${scopeMonthLabel(selectedPayment?.scopeDate)}`}
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
                       <TextField name="payedAmount" label="Kwota" inputType="number" formik={formik}/>

                   </form>
               }
               footer={
                   <ModalFooter
                       cancelLabel="Anuluj"
                       confirmLabel="Potwierdź wpłatę"
                       onConfirm={formik.handleSubmit}
                       onCancel={onHide}
                   />
               }
        />
    )
}