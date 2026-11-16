import {ReactNode} from "react";
import {Card} from "./Card.tsx";

/** The card above a list holding its search box and filters; items spread out and wrap on phones. */
export const FilterBar = ({children}: { children: ReactNode }) => (
    <Card padding="md" className="ku-filter-bar">
        <div className="ku-filter-bar-content">{children}</div>
    </Card>
);
