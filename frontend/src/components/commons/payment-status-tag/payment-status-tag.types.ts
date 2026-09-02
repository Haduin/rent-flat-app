import {PaymentStatus} from "../../../api/generated";

export const statusMap: Record<PaymentStatus, string> = {
    [PaymentStatus.Pending]: 'Oczekujące',
    [PaymentStatus.Paid]: 'Zapłacono',
    [PaymentStatus.Late]: 'Spóźnione',
    [PaymentStatus.Cancelled]: 'Anulowano',
    [PaymentStatus.PartiallyPaid]: 'Częściowo opłacone',
};