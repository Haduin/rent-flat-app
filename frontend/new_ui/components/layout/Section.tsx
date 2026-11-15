import {ReactNode} from "react";
import {Heading, HeadingSize} from "../ui/Heading.tsx";
import {Text} from "../ui/Text.tsx";

export interface SectionProps {
    title: ReactNode;
    /** Heading level in the page outline; h1 belongs to Page. */
    level?: 2 | 3;
    size?: HeadingSize;
    subtitle?: ReactNode;
    actions?: ReactNode;
    className?: string;
    children: ReactNode;
}

/** A titled block of a page: heading (+ subtitle) with its buttons on the right, content below. */
export const Section = ({title, level = 2, size, subtitle, actions, className, children}: SectionProps) => (
    <section className={["ku-section", `ku-section-${level}`, className].filter(Boolean).join(" ")}>
        <div className="ku-section-header">
            <div>
                <Heading level={level} size={size}>{title}</Heading>
                {subtitle && <Text as="p" tone="secondary" size="sm" className="ku-section-subtitle">{subtitle}</Text>}
            </div>
            {actions && <div className="ku-section-actions">{actions}</div>}
        </div>
        {children}
    </section>
);
