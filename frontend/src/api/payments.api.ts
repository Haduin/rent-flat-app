import {Payment, PaymentConfirmationDTO, PaymentSummary} from "../components/commons/types.ts";
import {axiosInstance} from "./api.ts";

export const paymentsApi: PaymentsApi = {
    getPayments: (mouth: string) => axiosInstance.get(`/payments/${mouth}`).then(response => response.data),
    generateMouthPayments: (mouth: string) => axiosInstance.post(`/payments/${mouth}`),
    confirmPayment: (paymentConfirmation: PaymentConfirmationDTO) => axiosInstance.post(`/payments/confirm`, paymentConfirmation),
    getPaymentSummaries: () => axiosInstance.get('/payments/summary').then(response => response.data)
}

export type PaymentsApi = {
    getPayments: (mouth: string) => Promise<Payment[]>
    generateMouthPayments: (mouth: string) => Promise<void>
    confirmPayment: (paymentConfirmation: PaymentConfirmationDTO) => Promise<void>
    getPaymentSummaries: () => Promise<PaymentSummary[]>
};
