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

const darkLabelColor = "var(--ku-on-ink-muted)";

const darkCaptionColor: Record<NonNullable<StatTileProps["captionTone"]>, string> = {
    success: "var(--ku-on-ink-success)",
    warning: "var(--ku-on-ink-warning)",
    danger: "var(--ku-on-ink-danger)",
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
        padding="md"
        className={`ku-stat-tile${dark ? " ku-stat-tile-dark" : ""}`}
        style={{
            background: dark ? "var(--ku-ink)" : "var(--ku-surface)",
            border: dark ? "none" : undefined,
        }}
    >
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
            <span style={{fontSize: "var(--ku-text-sm)", fontWeight: 500, color: dark ? darkLabelColor : "var(--ku-text-secondary)"}}>
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
                color: dark ? "var(--ku-on-ink)" : "var(--ku-text)",
            }}
        >
            {value}
        </div>
        {caption && (
            <div style={{fontSize: "var(--ku-text-sm)", fontWeight: 600, color: dark ? darkCaptionColor[captionTone] : captionColor[captionTone]}}>
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
