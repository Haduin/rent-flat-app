import {ReactNode} from "react";

export type HeadingSize = "base" | "md" | "xl";

const DEFAULT_SIZE: Record<2 | 3 | 4, HeadingSize> = {2: "md", 3: "base", 4: "base"};

/** h2-h4 on the type scale; the level follows the outline, `size` only when the design needs another step. */
export const Heading = ({level, size, className, children}: {
    level: 2 | 3 | 4;
    size?: HeadingSize;
    className?: string;
    children: ReactNode;
}) => {
    const Tag = `h${level}` as const;
    return <Tag className={["ku-heading", `ku-heading-${size ?? DEFAULT_SIZE[level]}`, className].filter(Boolean).join(" ")}>{children}</Tag>;
};
