import {Card} from "./Card.tsx";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {PaymentStatus} from "../../../src/api/generated";
import {isEqual, isNotEqual} from "../../../src/utils/typeguards";
import {pluralPl} from "../../utils/plural.ts";

export interface SettlementItem {
    amount: number;
    status: PaymentStatus;
}

export interface MonthSettlementSummaryProps {
    items: SettlementItem[];
    /** "Wpłacono" for rent coming in, "Zapłacono" for costs going out. */
    settledLabel: string;
    /** "Do zebrania" / "Do zapłaty". */
    outstandingLabel: string;
}

export const summarizeSettlement = (items: SettlementItem[]) => {
    const billable = items.filter((item) => isNotEqual(PaymentStatus.Cancelled, item.status));
    const total = billable.reduce((sum, item) => sum + item.amount, 0);
    const settled = billable.filter((item) => isEqual(PaymentStatus.Paid, item.status)).reduce((sum, item) => sum + item.amount, 0);
    return {
        total,
        settled,
        outstanding: total - settled,
        openCount: billable.filter((item) => isNotEqual(PaymentStatus.Paid, item.status)).length,
        lateCount: billable.filter((item) => isEqual(PaymentStatus.Late, item.status)).length,
    };
};

const countLabel = (count: number) => pluralPl(count, {one: "pozycja", few: "pozycje", many: "pozycji"});

/** One-line month answer to "how much is in, how much is still open" above a month-scoped list. */
export const MonthSettlementSummary = ({items, settledLabel, outstandingLabel}: MonthSettlementSummaryProps) => {
    if (0 === items.length) return null;
    const {total, settled, outstanding, openCount, lateCount} = summarizeSettlement(items);

    return (
        <Card padding={18} contentStyle={{display: "flex", flexWrap: "wrap", columnGap: 32, rowGap: 12}}>
            <div className="ku-settlement-figure">
                <span className="ku-settlement-label">{settledLabel}</span>
                <span className="ku-settlement-value">
                    {formatCurrency(settled)}
                    <span className="ku-settlement-of"> z {formatCurrency(total)}</span>
                </span>
            </div>
            <div className="ku-settlement-figure">
                <span className="ku-settlement-label">{outstandingLabel}</span>
                <span className="ku-settlement-value">
                    {formatCurrency(outstanding)}
                    <span className="ku-settlement-of"> · {countLabel(openCount)}</span>
                </span>
            </div>
            {lateCount > 0 && (
                <div className="ku-settlement-figure">
                    <span className="ku-settlement-label">Zaległe</span>
                    <span className="ku-settlement-value" style={{color: "var(--ku-danger)"}}>{countLabel(lateCount)}</span>
                </div>
            )}
        </Card>
    );
};
