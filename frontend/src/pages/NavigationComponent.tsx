import {Menubar} from "primereact/menubar";
import {Outlet, useNavigate} from "react-router";
import {MenuItemCommandEvent} from "primereact/menuitem";
import {IconField} from "primereact/iconfield";
import {InputIcon} from "primereact/inputicon";
import {Button} from "primereact/button";
import {confirmDialog} from "primereact/confirmdialog";
import {useOidc} from "../oidc.tsx";

const NavigationComponent = () => {
    const {logout} = useOidc({assert: "user logged in"});
    const items = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            url: '/protected/home'
        },
        {
            label: 'Koszta',
            icon: 'pi pi-home',
            url: '/protected/koszta'
        },
        {
            label: 'Mieszkanie',
            icon: 'pi pi-home',
            url: '/protected/mieszkanie'
        },
        {
            label: 'Osoby',
            icon: 'pi pi-user',
            url: '/protected/osoby'
        },
        {
            label: 'Kontrakty',
            icon: 'pi pi-envelope',
            url: '/protected/kontract'
        },
        {
            label: 'Płatnosci',
            icon: 'pi pi-credit-card',
            url: '/protected/platnosci',
        }
    ];
    const nav = useNavigate();

    const items2 = items.map((item) => ({
        ...item,
        command: (options: MenuItemCommandEvent) => {
            const originalEvent = options.originalEvent;
            originalEvent.preventDefault();
            originalEvent.stopPropagation();
            if (item.url) {
                nav(item.url);
            }
        },
    }));

    const handleLogout = () => {
        confirmDialog({
            message: <>
                Czy na pewno chcesz sie wylogować?
            </>,
            header: "Ekran wylogowywania",
            defaultFocus: "reject",
            acceptLabel: "Tak",
            rejectLabel: "Nie",
            accept() {
                logout({redirectTo: "home"})
            }

        })
    }

    const end = (
        <IconField iconPosition="right" className="flex items-center gap-1">
            <InputIcon className="pi pi-sign-in">
            </InputIcon>
            <Button label="Wyloguj się" onClick={handleLogout} className="p-button-sm"/>
        </IconField>

    );
    return (
        <>
            <Menubar className="top-0 sticky z-[999] p-menubar-smaller" model={items2} end={end}/>
            <Outlet/>
        </>

    )
};

export default NavigationComponent;
