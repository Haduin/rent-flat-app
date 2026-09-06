import {Tag} from "primereact/tag";
import {ReactNode} from "react";

export type BadgeTone = "success" | "warning" | "danger" | "neutral" | "accent";

export interface BadgeProps {
    tone: BadgeTone;
    children: ReactNode;
}

const toneSeverity: Record<BadgeTone, "success" | "warning" | "danger" | "secondary" | "info"> = {
    success: "success",
    warning: "warning",
    danger: "danger",
    neutral: "secondary",
    accent: "info",
};

export const Badge = ({tone, children}: BadgeProps) => (
    <Tag severity={toneSeverity[tone]} value={children as string}/>
);
