import {ReactNode} from "react";

export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export const PageHeader = ({title, subtitle, actions}: PageHeaderProps) => (
    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14}}>
        <div>
            <h1 style={{fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em"}}>{title}</h1>
            {subtitle && (
                <div style={{marginTop: 4, fontSize: 14, color: "var(--ku-text-secondary)"}}>{subtitle}</div>
            )}
        </div>
        {actions && <div style={{display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap"}}>{actions}</div>}
    </div>
);
