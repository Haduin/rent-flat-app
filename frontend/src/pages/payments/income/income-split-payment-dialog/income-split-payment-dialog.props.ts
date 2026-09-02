import {PaymentHistoryWithPersonDTO} from "../../../../api/generated";

export interface SplitPaymentDialogProps {
    isVisible: boolean;
    onHide: () => void;
    onConfirm: (date: Date, paymentId: number, amount: number) => void;
    selectedPayment: PaymentHistoryWithPersonDTO | null;
}
