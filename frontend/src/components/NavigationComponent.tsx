import {Menubar} from "primereact/menubar";
import {Outlet} from "react-router";

const NavigationComponent = () => {
    const items = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            url: '/'
        },
        {
            label: 'Osoby',
            icon: 'pi pi-star',
            url: '/osoby'
        },
        {
            label: 'Kontrakty',
            icon: 'pi pi-star',
            url: '/kontakt'
        },
        {
            label: 'Płatnosci',
            icon: 'pi pi-star',
            url: '/platnosci'
        },
        {
            label: 'Contact',
            icon: 'pi pi-envelope'
        }
    ];

    return (
        <>
            <Menubar model={items}/>
            <Outlet/>
        </>

    )
};

export default NavigationComponent;