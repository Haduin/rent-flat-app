import {PaymentStatus} from "../../../api/generated";

export interface StatusTagProps {
    status: PaymentStatus;
    className?: string;
}