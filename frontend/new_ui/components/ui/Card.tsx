import {CSSProperties, ReactNode} from "react";
import {Card as PCard} from "primereact/card";

export type CardPadding = "none" | "sm" | "md" | "lg";

const PADDING: Record<CardPadding, string | number> = {none: 0, sm: "var(--ku-space-4)", md: "var(--ku-space-5)", lg: "var(--ku-space-6)"};

export interface CardProps {
    children: ReactNode;
    className?: string;
    /** none: content goes edge to edge (tables, select-cards); sm: small tiles; md: default; lg: roomy detail panels. */
    padding?: CardPadding;
    style?: CSSProperties;
    /** Layout for the children (flex/gap/...): they render inside .p-card-content, not the outer .p-card that `style` targets. */
    contentStyle?: CSSProperties;
    highlighted?: boolean;
    /** Placeholder look for an empty slot (e.g. a free room). */
    dashed?: boolean;
}

export const Card = ({children, className, padding = "md", style, contentStyle, highlighted, dashed}: CardProps) => (
    <PCard
        className={className}
        pt={{
            body: {style: {padding: 0}},
            content: {style: {padding: PADDING[padding], ...contentStyle}},
        }}
        style={{
            border: highlighted ? "1.5px solid var(--ku-accent)" : dashed ? "1px dashed var(--ku-border-strong)" : "1px solid var(--ku-border)",
            boxShadow: highlighted ? "var(--ku-shadow-md)" : "none",
            ...style,
        }}
    >
        {children}
    </PCard>
);
