import {z} from "zod";

export const IncomeConfirmPaymentDialogSchema = z.object({
    date: z.date(),
    payedAmount: z.number().nullable(),
    paymentId: z.number().nullable(),
})