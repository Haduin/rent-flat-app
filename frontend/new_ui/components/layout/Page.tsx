import {ReactNode} from "react";

export interface PageProps {
    title: string;
    subtitle?: ReactNode;
    /** Page-level buttons, right of the title (wrap under it on phones). */
    actions?: ReactNode;
    children: ReactNode;
}

/** Every new_ui route: one h1 header, then its sections stacked on the page rhythm. */
export const Page = ({title, subtitle, actions, children}: PageProps) => (
    <div className="ku-page">
        <header className="ku-page-header">
            <div>
                <h1 className="ku-page-title">{title}</h1>
                {subtitle && <p className="ku-page-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="ku-page-actions">{actions}</div>}
        </header>
        {children}
    </div>
);
