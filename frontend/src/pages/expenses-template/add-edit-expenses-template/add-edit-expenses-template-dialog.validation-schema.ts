import * as Yup from 'yup';
import {ExpenseCategory} from "../../../api/generated";
import {ExpenseScope} from "./add-edit-expenses-template-dialog.types.ts";

// Yup's `.required()` produces a NonNullable type regardless of `.nullable()`,
// because it describes a *validated* value, not the draft state of the form.
// FormValues describes the form while it's still being filled in, so it's
// declared by hand (nullable) instead of via Yup.InferType.
export interface FormValues {
    expenseType: ExpenseScope;
    category: ExpenseCategory | null;
    expenseDate: string | null;
    amount: number | null;
    apartmentId?: string | null;
    roomId?: string | null;
}

export const schema = Yup.object().shape({
    expenseType: Yup.mixed<ExpenseScope>().oneOf(['general', 'property', 'room']).required(),
    category: Yup.mixed<ExpenseCategory>().nullable().required('Kategoria jest wymagana'),
    expenseDate: Yup.string().nullable().required('Podanie dnia wpłatności jest wymagane'),
    amount: Yup.number().nullable().min(1, 'Kwota musi być większa od 0').required("Kwota jest wymagana"),
    apartmentId: Yup.string().nullable().when('expenseType', {
        is: (expenseType: ExpenseScope) => expenseType === 'property' || expenseType === 'room',
        then: (schema) => schema.required('Mieszkanie jest wymagane'),
        otherwise: (schema) => schema.notRequired(),
    }),
    roomId: Yup.string().nullable().when('expenseType', {
        is: (expenseType: ExpenseScope) => expenseType === 'room',
        then: (schema) => schema.required('Pokój jest wymagany'),
        otherwise: (schema) => schema.notRequired(),
    }),
})