import {Payment} from "../../components/commons/types.ts";
import {useFormik} from "formik";
import {InputText} from "primereact/inputtext";
import {DateSelector} from "../../components/date-selector/date-selector.tsx";
import {useMemo} from "react";
import {Modal} from "../../components/modal/modal.tsx";
import {TextField} from "../../components/text-field/text-field.tsx";
import {ModalFooter} from "../../components/modal/footer/modal-footer.tsx";

interface ConfirmPaymentDialogProps {
    isVisible: boolean;
    onHide: () => void;
    onConfirm: (date: Date, paymentId: number, amount: number) => void;
    selectedPayment: Payment | null;
}

export const ConfirmPaymentDialog = ({isVisible, onHide, selectedPayment, onConfirm}: ConfirmPaymentDialogProps) => {

    const defaultValues = useMemo(() => ({
        date: new Date(),
        payedAmount: selectedPayment?.amount,
        paymentId: selectedPayment?.id,
    }), [selectedPayment?.amount, selectedPayment?.id])


    const formik = useFormik({
        initialValues: defaultValues,
        enableReinitialize: true,
        onSubmit: async (values) => {
            onConfirm(values.date, values.paymentId!!, values.payedAmount || 0);
        }
    })

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