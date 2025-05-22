import {Outlet} from "react-router";
import {AutoLogoutCountdown} from "./AutoLogoutCountdown";


export function Layout() {
    return (
        <>
            {/*<Header/>*/}
            <Outlet/>
            <AutoLogoutCountdown/>
        </>
    );
}
