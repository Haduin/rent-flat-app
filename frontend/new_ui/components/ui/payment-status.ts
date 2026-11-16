import {PaymentStatus} from "../../../src/api/generated";
import {BadgeTone} from "./Badge.tsx";

/** One set of status names for rent and cost payments across the new UI. */
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
    [PaymentStatus.Pending]: "Oczekuje",
    [PaymentStatus.Paid]: "Opłacone",
    [PaymentStatus.Late]: "Zaległe",
    [PaymentStatus.Cancelled]: "Anulowane",
    [PaymentStatus.PartiallyPaid]: "Częściowo",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
    [PaymentStatus.Pending]: "warning",
    [PaymentStatus.Paid]: "success",
    [PaymentStatus.Late]: "danger",
    [PaymentStatus.Cancelled]: "neutral",
    [PaymentStatus.PartiallyPaid]: "warning",
};
