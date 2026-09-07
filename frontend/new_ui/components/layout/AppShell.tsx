import {ReactNode, useEffect} from "react";
import {NavLink} from "react-router";
import {Menubar} from "primereact/menubar";
import {MenuItem, MenuItemOptions} from "primereact/menuitem";
import {confirmDialog} from "primereact/confirmdialog";
import {IconHome} from "../ui/icons.tsx";
import {useOidc} from "../../../src/oidc.tsx";
import "../../theme/tokens.css";

interface NavEntry {
    label: string;
    to: string;
}

const NAV_ENTRIES: NavEntry[] = [
    {label: "Dashboard", to: "/protected/v2/dashboard"},
    {label: "Mieszkania", to: "/protected/v2/mieszkania"},
    {label: "Kontrakty", to: "/protected/v2/kontrakty"},
    {label: "Wpłaty", to: "/protected/v2/platnosci/wplaty"},
    {label: "Koszty", to: "/protected/v2/platnosci/koszty"},
    {label: "Szablony kosztów", to: "/protected/v2/szablony-kosztow"},
    {label: "Osoby", to: "/protected/v2/osoby"},
];

export const AppShell = ({children}: { children: ReactNode }) => {
    const {logout, decodedIdToken} = useOidc({assert: "user logged in"});
    const initials = decodedIdToken.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    useEffect(() => {
        document.body.dataset.kuTheme = "a";
        return () => {
            delete document.body.dataset.kuTheme;
        };
    }, []);

    // PrimeReact's Menubar calls event.preventDefault() on click whenever `url` is unset, which
    // would kill NavLink's native <a> navigation — setting `url` alongside `template` keeps that
    // guard from firing while NavLink (not Menubar) drives the actual routing and active state.
    const items: MenuItem[] = NAV_ENTRIES.map((entry) => ({
        label: entry.label,
        url: entry.to,
        template: (item: MenuItem, options: MenuItemOptions) => (
            <NavLink
                to={entry.to}
                className={({isActive}) => `${options.className}${isActive ? " ku-nav-active" : ""}`}
            >
                <span className={options.labelClassName}>{item.label}</span>
            </NavLink>
        ),
    }));

    const start = (
        <div style={{display: "flex", alignItems: "center", gap: 10, paddingRight: 28}}>
            <div
                style={{
                    width: 30,
                    height: 30,
                    borderRadius: "var(--ku-radius-sm)",
                    background: "var(--ku-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <IconHome size={16} color="#ffffff"/>
            </div>
            <span
                style={{fontFamily: "var(--ku-font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em"}}>
                Kwatera
            </span>
        </div>
    );

    const handleLogout = () => {
        confirmDialog({
            message: "Czy na pewno chcesz się wylogować?",
            header: "Ekran wylogowywania",
            defaultFocus: "reject",
            acceptLabel: "Tak",
            rejectLabel: "Nie",
            accept() {
                logout({redirectTo: "current page"});
            },
        });
    };

    const end = (
        <button
            type="button"
            onClick={handleLogout}
            title="Wyloguj się"
            style={{
                width: 34,
                height: 34,
                borderRadius: "var(--ku-radius-pill)",
                background: "var(--ku-accent-soft)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ku-accent)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                flexShrink: 0,
            }}
        >
            {initials}
        </button>
    );

    return (
        <div className="kwatera-a" style={{minHeight: "100%", background: "var(--ku-bg)"}}>
            <Menubar
                model={items}
                start={start}
                end={end}
                className="ku-shell-header"
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    borderRadius: 0,
                    borderLeft: "none",
                    borderRight: "none",
                    borderTop: "none",
                    minHeight: 72,
                }}
            />
            <div className="ku-shell-content">{children}</div>
        </div>
    );
};
