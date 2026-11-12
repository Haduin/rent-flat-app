import {ReactNode} from "react";
import {Link} from "react-router";
import {Card} from "./Card.tsx";
import {isNotNullable} from "../../../src/utils/typeguards";

export interface StatTileProps {
    label: string;
    value: string;
    caption?: string;
    captionTone?: "success" | "warning" | "danger" | "neutral";
    icon?: ReactNode;
    dark?: boolean;
    /** Makes the whole tile a link to the list behind the figure. */
    to?: string;
}

const darkLabelColor = "oklch(75% 0.01 260)";

const darkCaptionColor: Record<NonNullable<StatTileProps["captionTone"]>, string> = {
    success: "oklch(72% 0.13 150)",
    warning: "oklch(80% 0.12 75)",
    danger: "oklch(74% 0.14 25)",
    neutral: darkLabelColor,
};

const captionColor: Record<NonNullable<StatTileProps["captionTone"]>, string> = {
    success: "var(--ku-success)",
    warning: "var(--ku-warning)",
    danger: "var(--ku-danger)",
    neutral: "var(--ku-text-secondary)",
};

const StatTileCard = ({label, value, caption, captionTone = "neutral", icon, dark}: Omit<StatTileProps, "to">) => (
    <Card
        padding={18}
        className={`ku-stat-tile${dark ? " ku-stat-tile-dark" : ""}`}
        style={{
            background: dark ? "var(--ku-ink)" : "var(--ku-surface)",
            border: dark ? "none" : undefined,
        }}
    >
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
            <span style={{fontSize: 13, fontWeight: 500, color: dark ? darkLabelColor : "var(--ku-text-secondary)"}}>
                {label}
            </span>
            {icon && !dark && (
                <div
                    className="ku-stat-icon"
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
            className="ku-stat-value"
            style={{
                fontWeight: 700,
                fontFamily: "var(--ku-font-display)",
                color: dark ? "#ffffff" : "var(--ku-text)",
            }}
        >
            {value}
        </div>
        {caption && (
            <div style={{fontSize: 12.5, fontWeight: 600, color: dark ? darkCaptionColor[captionTone] : captionColor[captionTone]}}>
                {caption}
            </div>
        )}
    </Card>
);

export const StatTile = ({to, ...tile}: StatTileProps) =>
    isNotNullable(to) ? (
        <Link to={to} className="ku-tile-link">
            <StatTileCard {...tile}/>
        </Link>
    ) : (
        <StatTileCard {...tile}/>
    );
