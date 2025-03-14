import {Route, Routes} from "react-router";
import NavigationComponent from "../components/NavigationComponent.tsx";
import Dashboard from "../components/Dashboard.tsx";
import PersonTable from "../components/person/PersonTable.tsx";
import PaymentsView from "../components/payments/PaymentsView.tsx";
import {Test} from "../components/Test.tsx";
import ContractsView from "../components/contracts/ContractsView.tsx";
import {HomePage} from "../components/home/home-page.tsx";
import {ApartmentPage} from "../components/apartment/apartment-page.tsx";

export const MyRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<NavigationComponent/>}>
                <Route path="/" element={<HomePage/>}/>
                <Route path="mieszkanie" element={<ApartmentPage/>}/>
                <Route index path="osoby" element={<PersonTable/>}/>
                <Route path="platnosci" element={<PaymentsView/>}/>
                <Route path="kontakt" element={<ContractsView/>}/>
                <Route path="dashboard" element={<Dashboard/>}/>
                <Route path="test" element={<Test/>}/>
            </Route>
        </Routes>
    );
};