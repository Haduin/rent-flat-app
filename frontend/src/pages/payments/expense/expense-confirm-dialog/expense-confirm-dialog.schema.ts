import {z} from "zod";

export const ExpenseConfirmDialogSchema = z.object({
    date: z.date(),
    payedAmount: z.number().nullable(),
    expenseId: z.number().nullable(),
})
