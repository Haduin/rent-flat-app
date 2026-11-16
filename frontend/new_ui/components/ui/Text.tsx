import {ReactNode} from "react";

export type TextTone = "default" | "secondary" | "muted" | "success" | "danger";

export interface TextProps {
    as?: "span" | "p" | "div";
    tone?: TextTone;
    size?: "xs" | "sm" | "base" | "md";
    weight?: "regular" | "medium" | "semibold";
    strike?: boolean;
    className?: string;
    children: ReactNode;
}

/** Body copy on the type scale and in a semantic tone - instead of a span with an inline color. */
export const Text = ({as: Tag = "span", tone = "default", size, weight, strike, className, children}: TextProps) => (
    <Tag
        className={[
            "ku-text",
            `ku-text-tone-${tone}`,
            size && `ku-text-size-${size}`,
            weight && `ku-text-weight-${weight}`,
            strike && "ku-text-strike",
            className,
        ].filter(Boolean).join(" ")}
    >
        {children}
    </Tag>
);
