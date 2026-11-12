import {isNullable} from "../../src/utils/typeguards";

/** "2026-08-01" → "01.08.2026"; parsed by parts so the day never shifts with the time zone. */
export const formatDatePl = (isoDate: string | null | undefined, fallback = "—") => {
    if (isNullable(isoDate) || "" === isoDate) return fallback;
    const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
    if (!year || !month || !day) return isoDate;
    return new Date(year, month - 1, day).toLocaleDateString("pl-PL", {day: "2-digit", month: "2-digit", year: "numeric"});
};

/** "2026-08-01" → local Date at midnight (by parts, no UTC shift); null when empty or malformed. */
export const parseIsoDate = (isoDate: string | null | undefined): Date | null => {
    if (isNullable(isoDate) || "" === isoDate) return null;
    const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};
