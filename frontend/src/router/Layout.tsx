import {Outlet} from "react-router";
import {AutoLogoutWarningOverlay} from "./AutoLogoutWarningOverlay";


export function Layout() {
    return (
        <>
            {/*<Header/>*/}
            <Outlet/>
            <AutoLogoutWarningOverlay/>
        </>
    );
}
