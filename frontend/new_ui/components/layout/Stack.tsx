import {CSSProperties, ReactNode} from "react";

export type SpaceToken = "0-5" | "1" | "2" | "3" | "4" | "5" | "6" | "8";

export interface StackProps {
    direction?: "column" | "row";
    gap?: SpaceToken;
    align?: CSSProperties["alignItems"];
    justify?: CSSProperties["justifyContent"];
    wrap?: boolean;
    as?: "div" | "ul" | "ol";
    className?: string;
    /** For the one-off tweak of a single use case; spacing and layout come from the props. */
    style?: CSSProperties;
    children: ReactNode;
}

/** Flex row/column on the spacing scale - the default way to lay things out next to each other. */
export const Stack = ({direction = "column", gap = "3", align, justify, wrap, as: Tag = "div", className, style, children}: StackProps) => (
    <Tag
        className={className}
        style={{
            display: "flex",
            flexDirection: direction,
            gap: `var(--ku-space-${gap})`,
            alignItems: align,
            justifyContent: justify,
            flexWrap: wrap ? "wrap" : undefined,
            ...style,
        }}
    >
        {children}
    </Tag>
);
