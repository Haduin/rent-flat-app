import {Tag} from "primereact/tag";
import {ReactNode} from "react";

export type BadgeTone = "success" | "warning" | "danger" | "neutral" | "accent" | "ended";

export interface BadgeProps {
    tone: BadgeTone;
    children: ReactNode;
}

// "ended" has no PrimeReact severity equivalent - it's styled via the .ku-tag-ended
// class (tokens.css) instead, so it stays visually distinct from "danger" (which
// already flags "already past end date, still active" elsewhere in the contracts list).
const toneSeverity: Partial<Record<BadgeTone, "success" | "warning" | "danger" | "secondary" | "info">> = {
    success: "success",
    warning: "warning",
    danger: "danger",
    neutral: "secondary",
    accent: "info",
};

export const Badge = ({tone, children}: BadgeProps) => (
    <Tag
        severity={toneSeverity[tone]}
        value={children as string}
        className={tone === "ended" ? "ku-tag-ended" : undefined}
    />
);
