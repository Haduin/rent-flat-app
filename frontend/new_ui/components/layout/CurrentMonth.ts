import {createContext, useContext} from "react";
import {isNull} from "../../../src/utils/typeguards";

export interface CurrentMonth {
    /** Always the 1st of the month, local time. */
    month: Date;
    setMonth: (month: Date) => void;
}

/** "listopad 2026" — the one month format the new UI shows to people. */
export const formatMonthLabel = (month: Date) => month.toLocaleDateString("pl-PL", {month: "long", year: "numeric"});

/** The month the month-scoped pages show (AppShell's MONTH_SCOPED_PATHS); AppShell holds it so the header chip and those pages stay in sync. */
export const CurrentMonthContext = createContext<CurrentMonth | null>(null);

export const useCurrentMonth = () => {
    const context = useContext(CurrentMonthContext);
    if (isNull(context)) {
        throw new Error("useCurrentMonth must be used inside AppShell");
    }
    return context;
};
