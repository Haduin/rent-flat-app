import {useFormik} from "formik";
import {useMemo} from "react";
import {Modal} from "../../../../components/modal/modal.tsx";
import {ModalFooter} from "../../../../components/modal/footer/modal-footer.tsx";
import {TextField} from "../../../../components/text-field/text-field.tsx";
import {DateSelector} from "../../../../components/date-selector/date-selector.tsx";
import {SelectField} from "../../../../components/select/select-field.tsx";
import {dateToStringFullYearMouthDay} from "../../../../components/commons/dateFormatter.ts";
import {ExpenseCategory} from "../../../../api/generated";
import {expensesMap} from "../../../expenses-template/add-edit-expenses-template/add-edit-expenses-template-dialog.types.ts";
import {EditExpenseDialogProps} from "./edit-expense-dialog.props.ts";
import {EditExpenseFormValues, editExpenseValidationSchema} from "./edit-expense-dialog.validation-schema.ts";

const categoryOptions = (Object.entries(expensesMap) as [ExpenseCategory, string][]).map(
    ([value, label]) => ({label, value})
);

export const EditExpenseDialog = ({isVisible, onHide, selectedExpense, onConfirm}: EditExpenseDialogProps) => {

    const defaultValues: EditExpenseFormValues = useMemo(() => ({
        costDate: selectedExpense?.costDate ? new Date(selectedExpense.costDate) : null,
        amount: selectedExpense?.amount ?? null,
        category: selectedExpense?.category ?? null,
        description: selectedExpense?.description ?? '',
        invoiceNumber: selectedExpense?.invoiceNumber ?? '',
    }), [selectedExpense])

    const formik = useFormik<EditExpenseFormValues>({
        initialValues: defaultValues,
        enableReinitialize: true,
        validationSchema: editExpenseValidationSchema,
        onSubmit: (values) => {
            if (!selectedExpense) return;
            onConfirm({
                id: selectedExpense.id,
                costDate: values.costDate ? dateToStringFullYearMouthDay(values.costDate) : null,
                amount: values.amount,
                category: values.category as ExpenseCategory,
                description: values.description || null,
                invoiceNumber: values.invoiceNumber || null,
            });
        }
    })

    if (!isVisible)
        return null;

    return (
        <Modal isOpen={isVisible}
               title="Edytuj wydatek"
               onClose={onHide}
               content={
                   <form>
                       <SelectField
                           label="Kategoria wydatku"
                           name="category"
                           options={categoryOptions}
                           formik={formik}
                       />
                       <DateSelector formik={formik} name="costDate" label="Termin płatności"/>
                       <TextField name="amount" label="Kwota" formik={formik} inputType="number"/>
                       <TextField name="invoiceNumber" label="Numer faktury" formik={formik}/>
                       <TextField name="description" label="Opis" formik={formik}/>
                   </form>
               }
               footer={
                   <ModalFooter
                       cancelLabel="Anuluj"
                       confirmLabel="Zapisz zmiany"
                       onConfirm={formik.handleSubmit}
                       onCancel={onHide}
                   />
               }
        />
    );
};
