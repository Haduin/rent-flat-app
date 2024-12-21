import {Route, Routes} from "react-router";
import NavigationComponent from "../components/NavigationComponent.tsx";
import OsobyTabela from "../components/OsobyTabela.tsx";
import Dashboard from "../components/Dashboard.tsx";

export const MyRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<NavigationComponent />} >
                <Route index path="osoby" element={<OsobyTabela/>} />
                <Route path="dashboard" element={<Dashboard/>} />
            </Route>
        </Routes>
    );
};