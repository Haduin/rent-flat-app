import {ReactNode} from "react";
import {SpaceToken} from "./Stack.tsx";

export interface GridProps {
    /** Narrowest a tile may get before the grid drops a column, e.g. "180px". */
    min: string;
    gap?: SpaceToken;
    className?: string;
    children: ReactNode;
}

/** Responsive tile grid: as many columns as fit, never wider than the container on phones. */
export const Grid = ({min, gap = "4", className, children}: GridProps) => (
    <div
        className={className}
        style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}, 100%), 1fr))`,
            gap: `var(--ku-space-${gap})`,
        }}
    >
        {children}
    </div>
);
