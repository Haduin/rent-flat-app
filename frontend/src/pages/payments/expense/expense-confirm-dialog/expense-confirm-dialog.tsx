import {useFormik} from "formik";
import {InputText} from "primereact/inputtext";
import {DateSelector} from "../../../../components/date-selector/date-selector.tsx";
import {Modal} from "../../../../components/modal/modal.tsx";
import {TextField} from "../../../../components/text-field/text-field.tsx";
import {ModalFooter} from "../../../../components/modal/footer/modal-footer.tsx";
import {ExpenseConfirmDialogProps} from "./expense-confirm-dialog.props.ts";
import {ExpenseConfirmDialogSchema} from "./expense-confirm-dialog.schema.ts";
import {z} from "zod";
import {useMemo} from "react";

export const ExpenseConfirmDialog = ({
                                          isVisible,
                                          onHide,
                                          selectedExpense,
                                          onConfirm
                                      }: ExpenseConfirmDialogProps) => {

    const defaultValues: z.infer<typeof ExpenseConfirmDialogSchema> = useMemo(() => ({
        date: new Date(),
        payedAmount: selectedExpense?.amount ?? null,
        expenseId: selectedExpense?.id ?? null,
    }), [selectedExpense?.amount, selectedExpense?.id])

    const formik = useFormik<z.infer<typeof ExpenseConfirmDialogSchema>>({
        initialValues: defaultValues,
        enableReinitialize: true,
        onSubmit: async (values) => {
            onConfirm(values.date, values.expenseId!!, values.payedAmount || 0);
        }
    })

    if (!isVisible)
        return null;

    const target = selectedExpense?.roomDetails?.roomName ?? selectedExpense?.apartmentDetails?.name ?? "ogólny";

    return (
        <Modal isOpen={isVisible}
               title="Potwierdź opłacenie kosztu"
               onClose={onHide}
               content={
                   <form>
                       <div className="flex flex-column gap-2">
                           <label className="block text-sm font-medium" htmlFor="expense-target">Mieszkanie / pokój</label>

                           <InputText disabled value={target} id="expense-target"/>
                       </div>

                       <DateSelector formik={formik} name="date" label="Data zapłaty"/>
                       <TextField name="payedAmount" label="Kwota" formik={formik}/>

                   </form>
               }
               footer={
                   <ModalFooter
                       cancelLabel="Anuluj"
                       confirmLabel="Potwierdź"
                       onConfirm={formik.handleSubmit}
                       onCancel={onHide}
                   />
               }
        />
    )
}
