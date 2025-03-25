import {Menubar} from "primereact/menubar";
import {Outlet, useNavigate} from "react-router";
import {MenuItemCommandEvent} from "primereact/menuitem";

const NavigationComponent = () => {
    const items = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            url: '/protected/home'
        },
        {
            label: 'Mieszkanie',
            icon: 'pi pi-home',
            url: '/protected/mieszkanie'
        },
        {
            label: 'Osoby',
            icon: 'pi pi-star',
            url: '/protected/osoby'
        },
        {
            label: 'Kontrakty',
            icon: 'pi pi-star',
            url: '/protected/kontakt'
        },
        {
            label: 'Płatnosci',
            icon: 'pi pi-star',
            url: '/protected/platnosci'
        },
        {
            label: 'Contact',
            icon: 'pi pi-envelope'
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

    return (
        <>
            <Menubar model={items2}/>
            <Outlet/>
        </>

    )
};

export default NavigationComponent;