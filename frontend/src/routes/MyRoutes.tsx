import {Route, Routes} from "react-router";
import NavigationComponent from "../components/NavigationComponent.tsx";
import Dashboard from "../components/Dashboard.tsx";
import PersonTable from "../components/person/PersonTable.tsx";
import PaymentsView from "../components/PaymentsView.tsx";
import {Test} from "../components/Test.tsx";

export const MyRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<NavigationComponent/>}>
                <Route index path="osoby" element={<PersonTable/>}/>
                <Route path="platnosci" element={<PaymentsView/>}/>
                <Route path="dashboard" element={<Dashboard/>}/>
                <Route path="test" element={<Test/>}/>
            </Route>
        </Routes>
    );
};