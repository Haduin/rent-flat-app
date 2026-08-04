import {EditPayment, Payment, PaymentConfirmationDTO} from "../components/commons/types.ts";
import {axiosInstance} from "./expenses-template.api.ts";
import {PaymentSortableField, SortOrder} from "../pages/payments/income/income-payments-view/income-payments.model.ts";
import {config} from "./config.api";

export const paymentsApi = new PaymentsApi(config);


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
    editPayment: (editPayment: EditPayment) => axiosInstance.put('/payments/edit', editPayment).then(response => response.data),
}

export type PaymentsApi = {
    getPayments: (mouth: string, sortField?: PaymentSortableField, sortOrder?: SortOrder) => Promise<Payment[]>
    generateMouthPayments: (mouth: string) => Promise<void>
    confirmPayment: (paymentConfirmation: PaymentConfirmationDTO) => Promise<void>
    editPayment: (editPayment: EditPayment) => Promise<void>
};
