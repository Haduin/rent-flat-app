import * as Yup from 'yup';

export interface EditExpenseFormValues {
    costDate: Date | null;
    amount: number | null;
    category: string | null;
    description: string;
    invoiceNumber: string;
}

export const editExpenseValidationSchema = Yup.object().shape({
    costDate: Yup.date().nullable(),
    amount: Yup.number().nullable().required("Kwota jest wymagana").moreThan(0, "Kwota musi być większa od zera"),
    category: Yup.string().nullable().required("Kategoria jest wymagana"),
    description: Yup.string(),
    invoiceNumber: Yup.string(),
});
