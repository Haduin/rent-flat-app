import {ReactNode} from "react";

export interface DetailItem {
    label: string;
    value: ReactNode;
}

/**
 * Label-left / value-right facts.
 * default: body of a details dialog; compact: "what you're acting on" box atop a form;
 * footer: the closing lines of a card (rent, net result) under one divider.
 */
export const DetailList = ({items, variant = "default"}: { items: DetailItem[]; variant?: "default" | "compact" | "footer" }) => (
    <dl className={`ku-detail-list${"default" === variant ? "" : ` ku-detail-list-${variant}`}`}>
        {items.map(({label, value}) => (
            <div key={label} className="ku-detail-row">
                <dt>{label}</dt>
                <dd>{value}</dd>
            </div>
        ))}
    </dl>
);
