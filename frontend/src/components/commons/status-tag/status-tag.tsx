import {Tag} from "primereact/tag";
import {getStatusLabel, Status} from "../types.ts";

interface StatusTagProps {
    status: Status;
    className?: string;
}

const StatusTag = ({status, className}: StatusTagProps) => {
    return <Tag className={className} value={getStatusLabel(status)} severity={getTagSeverity(status)}/>;
};

const getTagSeverity = (status: Status): "warning" | "success" | "danger" | "info" | "secondary" | "contrast" | null => {
    switch (status) {
        case Status.LATE:
        case Status.PENDING:
            return 'warning';
        case Status.PAID:
            return 'success';
        case Status.CANCELLED:
            return 'danger';
        default:
            return 'info';
    }
};
export default StatusTag;
