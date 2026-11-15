import {ReactNode, useEffect, useRef, useState} from "react";
import {NavLink, useLocation} from "react-router";
import {Menubar} from "primereact/menubar";
import {MenuItem, MenuItemOptions} from "primereact/menuitem";
import {confirmDialog} from "primereact/confirmdialog";
import {OverlayPanel} from "primereact/overlaypanel";
import {Calendar} from "primereact/calendar";
import {IconBuilding, IconCalendar, IconFileText, IconGrid, IconHome, IconTrendingUp, IconUsers, IconWallet} from "../ui/icons.tsx";
import {BottomNav, BottomNavEntry} from "./BottomNav.tsx";
import {CurrentMonthContext, formatMonthLabel} from "./CurrentMonth.ts";
import {Button} from "../ui/Button.tsx";
import {useOidc} from "../../../src/oidc.tsx";
import {isNotEqual, isNotNullable} from "../../../src/utils/typeguards";
import "../../theme/tokens.css";
import "../../theme/primereact.css";
import "../../theme/components.css";

const NAV_ENTRIES: BottomNavEntry[] = [
    {label: "Dashboard", to: "/protected/v2/dashboard", icon: <IconGrid size={20}/>},
    {label: "Mieszkania", to: "/protected/v2/mieszkania", icon: <IconBuilding size={20}/>},
    {label: "Kontrakty", to: "/protected/v2/kontrakty", icon: <IconFileText size={20}/>},
    {label: "Wpłaty", to: "/protected/v2/platnosci/wplaty", icon: <IconTrendingUp size={20}/>},
    {label: "Koszty", to: "/protected/v2/platnosci/koszty", icon: <IconWallet size={20}/>},
    {label: "Szablony kosztów", to: "/protected/v2/szablony-kosztow", icon: <IconCalendar size={20}/>},
    {label: "Osoby", to: "/protected/v2/osoby", icon: <IconUsers size={20}/>},
];

// Phones/tablets get these as bottom tabs (daily bookkeeping first); the rest go under "Więcej".
const BOTTOM_TAB_LABELS = ["Dashboard", "Wpłaty", "Koszty", "Kontrakty"];
const PRIMARY_ENTRIES = BOTTOM_TAB_LABELS.map((label) => NAV_ENTRIES.find((entry) => entry.label === label)!);
const MORE_ENTRIES = NAV_ENTRIES.filter((entry) => !BOTTOM_TAB_LABELS.includes(entry.label));

const PRODUCT_NAME = "Mieszkania";

// Only these pages filter by the shared month; elsewhere the header chip is hidden.
const MONTH_SCOPED_PATHS = ["/protected/v2/dashboard", "/protected/v2/platnosci/wplaty", "/protected/v2/platnosci/koszty"];

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const AppShell = ({children}: { children: ReactNode }) => {
    const {logout} = useOidc({assert: "user logged in"});
    const {pathname} = useLocation();
    const [month, setMonthState] = useState(() => startOfMonth(new Date()));
    const setMonth = (date: Date) => setMonthState(startOfMonth(date));
    const monthPicker = useRef<OverlayPanel>(null);
    const monthLabelButton = useRef<HTMLButtonElement>(null);
    const isMonthScoped = MONTH_SCOPED_PATHS.some((path) => pathname.startsWith(path));
    const currentMonth = startOfMonth(new Date());
    const monthLabel = formatMonthLabel(month);

    const pickMonth = (date: Date) => {
        setMonth(date);
        monthPicker.current?.hide();
    };

    useEffect(() => {
        document.body.dataset.kuTheme = "a";
        return () => {
            delete document.body.dataset.kuTheme;
        };
    }, []);

    useEffect(() => {
        const current = NAV_ENTRIES.find((entry) => pathname.startsWith(entry.to));
        document.title = current && isNotEqual(PRODUCT_NAME, current.label) ? `${current.label} · ${PRODUCT_NAME}` : PRODUCT_NAME;
        return () => {
            document.title = PRODUCT_NAME;
        };
    }, [pathname]);

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
        <NavLink to="/protected/v2/dashboard" className="ku-brand" aria-label={`${PRODUCT_NAME} — Dashboard`}>
            <span className="ku-brand-mark">
                <IconHome size={16} color="var(--ku-accent-contrast)"/>
            </span>
            <span className="ku-brand-name">{PRODUCT_NAME}</span>
        </NavLink>
    );

    const handleLogout = () => {
        confirmDialog({
            message: "Czy na pewno chcesz się wylogować?",
            header: "Wylogowanie",
            defaultFocus: "reject",
            acceptLabel: "Tak",
            rejectLabel: "Nie",
            accept() {
                logout({redirectTo: "current page"});
            },
        });
    };

    const end = (
        <div className="ku-shell-end">
            {isMonthScoped && (
                <div className="ku-month-chip" role="group" aria-label="Miesiąc">
                    <button
                        type="button"
                        className="ku-month-chip-step"
                        aria-label="Poprzedni miesiąc"
                        onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))}
                    >
                        <i className="pi pi-chevron-left" aria-hidden="true"/>
                    </button>
                    <button
                        ref={monthLabelButton}
                        type="button"
                        className="ku-month-chip-label"
                        aria-label={`Wybierz miesiąc, obecnie ${monthLabel}`}
                        aria-haspopup="dialog"
                        onClick={(event) => monthPicker.current?.toggle(event)}
                    >
                        <span aria-live="polite">{monthLabel}</span>
                    </button>
                    <button
                        type="button"
                        className="ku-month-chip-step"
                        aria-label="Następny miesiąc"
                        onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))}
                    >
                        <i className="pi pi-chevron-right" aria-hidden="true"/>
                    </button>
                    <OverlayPanel
                        ref={monthPicker}
                        className="ku-month-picker"
                        role="dialog"
                        aria-label="Wybierz miesiąc"
                        onShow={() => document.querySelector<HTMLElement>(".ku-month-picker .p-monthpicker-month.p-highlight")?.focus()}
                        onHide={() => monthLabelButton.current?.focus()}
                    >
                        <Calendar
                            inline
                            view="month"
                            locale="pl"
                            value={month}
                            onChange={(event) => isNotNullable(event.value) && pickMonth(event.value)}
                        />
                        {isNotEqual(currentMonth.getTime(), month.getTime()) && (
                            <Button variant="secondary" size="small" className="ku-month-picker-today" onClick={() => pickMonth(currentMonth)}>
                                Bieżący miesiąc
                            </Button>
                        )}
                    </OverlayPanel>
                </div>
            )}
            {/* at ≤1024px logout lives at the bottom of the "Więcej" sheet instead */}
            <Button variant="secondary" size="small" className="ku-shell-logout" onClick={handleLogout}>
                Wyloguj
            </Button>
        </div>
    );

    return (
        <CurrentMonthContext.Provider value={{month, setMonth}}>
            <div className="kwatera-a" style={{minHeight: "100%", background: "var(--ku-bg)"}}>
                <header>
                    {/* at ≤1024px components.css hides this nav (and PrimeReact's own hamburger) in favour of BottomNav */}
                    <Menubar model={items} start={start} end={end} ariaLabel="Główna nawigacja" className="ku-shell-header"/>
                </header>
                <main className="ku-shell-content">{children}</main>
                <BottomNav primary={PRIMARY_ENTRIES} more={MORE_ENTRIES} onLogout={handleLogout}/>
            </div>
        </CurrentMonthContext.Provider>
    );
};
