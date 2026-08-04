import {Tag} from "primereact/tag";
import {PaymentStatus} from "../../../api/generated";
import {StatusTagProps} from "./payment-status-tag.props.ts";
import {statusMap} from "./payment-status-tag.types.ts";


const PaymentStatusTag = ({status, className}: StatusTagProps) => {
    return <Tag className={className} value={getStatusLabel(status)} severity={getTagSeverity(status)}/>;
};

export const getStatusLabel = (status: PaymentStatus): string => {
    return statusMap[status] || 'Nieznany';
};
const getTagSeverity = (status: PaymentStatus): "warning" | "success" | "danger" | "info" | "secondary" | "contrast" | null => {
    switch (status) {
        case PaymentStatus.Late:
        case PaymentStatus.Pending:
            return 'warning';
        case PaymentStatus.Paid:
            return 'success';
        case PaymentStatus.Cancelled:
            return 'danger';
        default:
            return 'info';
    }
};
export default PaymentStatusTag;
