import {ReactNode, useState} from "react";
import {NavLink, useLocation} from "react-router";
import {Sidebar} from "primereact/sidebar";
import {IconMore} from "../ui/icons.tsx";

export interface BottomNavEntry {
    label: string;
    to: string;
    icon: ReactNode;
}

export interface BottomNavProps {
    primary: BottomNavEntry[];
    more: BottomNavEntry[];
    onLogout: () => void;
}

const itemClassName = ({isActive}: { isActive: boolean }) =>
    `ku-bottom-nav-item${isActive ? " ku-nav-active" : ""}`;

/** Phone/tablet navigation (≤1024px): thumb-reach tabs plus a "Więcej" sheet for the rarer sections. */
export const BottomNav = ({primary, more, onLogout}: BottomNavProps) => {
    const [moreOpen, setMoreOpen] = useState(false);
    const {pathname} = useLocation();
    const moreActive = more.some((entry) => pathname.startsWith(entry.to));

    return (
        <>
            <nav className="ku-bottom-nav" aria-label="Główna nawigacja">
                {primary.map((entry) => (
                    <NavLink key={entry.to} to={entry.to} className={itemClassName}>
                        {entry.icon}
                        <span>{entry.label}</span>
                    </NavLink>
                ))}
                <button
                    type="button"
                    className={`ku-bottom-nav-item${moreActive ? " ku-nav-active" : ""}`}
                    aria-haspopup="dialog"
                    aria-expanded={moreOpen}
                    onClick={() => setMoreOpen(true)}
                >
                    <IconMore size={20}/>
                    <span>Więcej</span>
                </button>
            </nav>
            <Sidebar
                visible={moreOpen}
                onHide={() => setMoreOpen(false)}
                position="bottom"
                appendTo="self"
                className="ku-more-sheet"
                header={<span className="ku-more-sheet-title">Więcej</span>}
                ariaCloseLabel="Zamknij"
            >
                <nav aria-label="Pozostałe sekcje">
                    {more.map((entry) => (
                        <NavLink
                            key={entry.to}
                            to={entry.to}
                            onClick={() => setMoreOpen(false)}
                            className={({isActive}) => `ku-sheet-link${isActive ? " ku-nav-active" : ""}`}
                        >
                            {entry.icon}
                            {entry.label}
                        </NavLink>
                    ))}
                </nav>
                <button
                    type="button"
                    className="ku-sheet-link ku-sheet-logout"
                    onClick={() => {
                        setMoreOpen(false);
                        onLogout();
                    }}
                >
                    <i className="pi pi-sign-out" aria-hidden="true"/>
                    Wyloguj się
                </button>
            </Sidebar>
        </>
    );
};
