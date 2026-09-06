import {Outlet} from "react-router";
import {AppShell} from "../components/layout/AppShell.tsx";

const NewUiLayout = () => (
    <AppShell>
        <Outlet/>
    </AppShell>
);

export default NewUiLayout;
