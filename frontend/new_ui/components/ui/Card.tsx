import {CSSProperties, ReactNode} from "react";
import {Card as PCard} from "primereact/card";

export interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: number;
    style?: CSSProperties;
    /** Layout for the children (flex/gap/...): they render inside .p-card-content, not the outer .p-card that `style` targets. */
    contentStyle?: CSSProperties;
    highlighted?: boolean;
}

export const Card = ({children, className, padding = 20, style, contentStyle, highlighted}: CardProps) => (
    <PCard
        className={className}
        pt={{
            body: {style: {padding: 0}},
            content: {style: {padding, ...contentStyle}},
        }}
        style={{
            border: highlighted ? "1.5px solid var(--ku-accent)" : "1px solid var(--ku-border)",
            boxShadow: highlighted ? "var(--ku-shadow-md)" : "none",
            ...style,
        }}
    >
        {children}
    </PCard>
);
