import {ReactNode} from "react";

export interface DetailItem {
    label: string;
    value: ReactNode;
}

/** Label-left / value-right facts: the read-only body of a details dialog and the "what you're acting on" summary atop a form. */
export const DetailList = ({items, compact = false}: { items: DetailItem[]; compact?: boolean }) => (
    <dl className={`ku-detail-list${compact ? " ku-detail-list-compact" : ""}`}>
        {items.map(({label, value}) => (
            <div key={label} className="ku-detail-row">
                <dt>{label}</dt>
                <dd>{value}</dd>
            </div>
        ))}
    </dl>
);
