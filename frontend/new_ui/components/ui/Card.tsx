import {CSSProperties, ReactNode} from "react";
import {Card as PCard} from "primereact/card";

export interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: number;
    style?: CSSProperties;
    highlighted?: boolean;
}

export const Card = ({children, className, padding = 20, style, highlighted}: CardProps) => (
    <PCard
        className={className}
        pt={{
            body: {style: {padding: 0}},
            content: {style: {padding}},
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
