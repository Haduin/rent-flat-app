import {EditPayment} from "../../../../components/commons/types.ts";
import {PaymentHistoryWithPersonDTO} from "../../../../api/generated";

export interface EditPaymentDialogProps {
    isVisible: boolean;
    onHide: () => void;
    onConfirm: (payment: EditPayment) => Promise<void>;
    selectedPayment: PaymentHistoryWithPersonDTO | null;
}