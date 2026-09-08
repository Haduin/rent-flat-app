import {z} from "zod";

export const IncomeSplitPaymentDialogSchema = z.object({
    date: z.date(),
    amount: z.number().nullable(),
    paymentId: z.number().nullable(),
})
