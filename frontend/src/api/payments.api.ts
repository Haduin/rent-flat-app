import {EditPayment, Payment, PaymentConfirmationDTO, PaymentSummary} from "../components/commons/types.ts";
import {axiosInstance} from "./api.ts";
import {PaymentSortableField, SortOrder} from "../pages/payments/model/payments.model.ts";

export const paymentsApi: PaymentsApi = {
    getPayments: (mouth: string, sortField?: PaymentSortableField, sortOrder?: SortOrder) =>
        axiosInstance.get(`/payments/${mouth}`, {
            params: {
                ...(sortField && {sortField: sortField}),
                ...(sortOrder && {sortOrder: sortOrder})
            }
        }).then(response => response.data),
    generateMouthPayments: (mouth: string) => axiosInstance.post(`/payments/${mouth}`),
    confirmPayment: (paymentConfirmation: PaymentConfirmationDTO) => axiosInstance.post(`/payments/confirm`, paymentConfirmation),
    getPaymentSummaries: () => axiosInstance.get('/payments/summary').then(response => response.data),
    editPayment: (editPayment: EditPayment) => axiosInstance.put('/payments/edit', editPayment).then(response => response.data),
}

export type PaymentsApi = {
    getPayments: (mouth: string, sortField?: PaymentSortableField, sortOrder?: SortOrder) => Promise<Payment[]>
    generateMouthPayments: (mouth: string) => Promise<void>
    confirmPayment: (paymentConfirmation: PaymentConfirmationDTO) => Promise<void>
    getPaymentSummaries: () => Promise<PaymentSummary[]>
    editPayment: (editPayment: EditPayment) => Promise<void>
};
