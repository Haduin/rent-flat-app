import {Tag} from "primereact/tag";
import {getStatusLabel, Status} from "../types.ts";

interface StatusTagProps {
    status: Status;
}

const StatusTag = ({status}: StatusTagProps) => {
    return <Tag value={getStatusLabel(status)} severity={getTagSeverity(status)}/>;
};

const getTagSeverity = (status: Status): "warning" | "success" | "danger" | "info" | "secondary" | "contrast" | null => {
    switch (status) {
        case Status.PENDING:
            return 'warning';
        case Status.PAID:
            return 'success';
        case Status.LATE:
            return 'danger';
        default:
            return 'info';
    }
};
export default StatusTag;
