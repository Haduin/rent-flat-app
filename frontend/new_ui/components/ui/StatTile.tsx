import {ReactNode} from "react";
import {Card} from "./Card.tsx";

export interface StatTileProps {
    label: string;
    value: string;
    caption?: string;
    captionTone?: "success" | "warning" | "danger" | "neutral";
    icon?: ReactNode;
    dark?: boolean;
}

const captionColor: Record<NonNullable<StatTileProps["captionTone"]>, string> = {
    success: "var(--ku-success)",
    warning: "var(--ku-warning)",
    danger: "var(--ku-danger)",
    neutral: "var(--ku-text-secondary)",
};

export const StatTile = ({label, value, caption, captionTone = "neutral", icon, dark}: StatTileProps) => (
    <Card
        padding={18}
        style={{
            background: dark ? "var(--ku-ink)" : "var(--ku-surface)",
            border: dark ? "none" : undefined,
            display: "flex",
            flexDirection: "column",
            gap: 10,
        }}
    >
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
            <span style={{fontSize: 13, fontWeight: 500, color: dark ? "oklch(75% 0.01 260)" : "var(--ku-text-secondary)"}}>
                {label}
            </span>
            {icon && !dark && (
                <div
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: "var(--ku-radius-sm)",
                        background: "var(--ku-accent-soft)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--ku-accent)",
                    }}
                >
                    {icon}
                </div>
            )}
        </div>
        <div
            style={{
                fontSize: 28,
                fontWeight: 700,
                fontFamily: "var(--ku-font-display)",
                color: dark ? "#ffffff" : "var(--ku-text)",
            }}
        >
            {value}
        </div>
        {caption && (
            <div style={{fontSize: 12.5, fontWeight: 600, color: dark ? "oklch(65% 0.12 150)" : captionColor[captionTone]}}>
                {caption}
            </div>
        )}
    </Card>
);
