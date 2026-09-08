import {lazy, Suspense} from "react";
import {createBrowserRouter} from "react-router";
import {Layout} from "./Layout";
import {getOidc} from "../oidc.tsx";
import ApartmentPage from "../pages/apartment/apartment-page.tsx";
import {UtilityPage} from "../pages/utility/utility-page.tsx";

const ExpensesTemplateView = lazy(() => import("../pages/expenses-template/expenses-template-view/expenses-template-view.tsx"));
const PublicPage = lazy(() => import("../pages/PublicPage"));
const NavigationComponent = lazy(() => import("../pages/NavigationComponent.tsx"));
const HomePage = lazy(() => import ("../pages/home/home-page.tsx"))
const ApartmentsPage = lazy(() => import ("../pages/apartment/apartments-page.tsx"))
const PersonTable = lazy(() => import ("../pages/person/person-table/person-table.tsx"))
const PaymentsView = lazy(() => import ("../pages/payments/payments-view.tsx"))
const ContractsView = lazy(() => import ("../pages/contracts/contract-view/contracts-view.tsx"))
const StatisticsPage = lazy(() => import ("../pages/statistics/statistics-page.tsx"))

const NewUiLayout = lazy(() => import("../../new_ui/pages/NewUiLayout.tsx"))
const NewUiDashboardPage = lazy(() => import("../../new_ui/features/dashboard/DashboardPage.tsx"))
const NewUiApartmentsPage = lazy(() => import("../../new_ui/features/apartments/ApartmentsPage.tsx"))
const NewUiContractsPage = lazy(() => import("../../new_ui/features/contracts/ContractsPage.tsx"))
const NewUiPersonsPage = lazy(() => import("../../new_ui/features/persons/PersonsPage.tsx"))
const NewUiIncomePaymentsPage = lazy(() => import("../../new_ui/features/payments-income/IncomePaymentsPage.tsx"))
const NewUiExpensePaymentsPage = lazy(() => import("../../new_ui/features/payments-expense/ExpensePaymentsPage.tsx"))
const NewUiExpenseTemplatesPage = lazy(() => import("../../new_ui/features/expense-templates/ExpenseTemplatesPage.tsx"))


export const router = createBrowserRouter([
    {
        path: "/",
        Component: Layout,
        children: [
            {
                path: "/protected",
                loader: async ({request}) => {
                    await enforceLogin(request);

                    return null;
                },
                element: <NavigationComponent/>,
                children: [
                    {
                        index: true,
                        path: "/protected/home",
                        element: <HomePage/>,
                    },
                    {
                        path: "/protected/mieszkanie",
                        element: <ApartmentsPage/>,
                    },
                    {
                        path: "/protected/mieszkanie/:id",
                        element: <ApartmentPage/>
                    },
                    {
                        path: "/protected/osoby",
                        element: <PersonTable/>,
                    },
                    {
                        path: "/protected/platnosci",
                        element: <PaymentsView/>,
                    },
                    {
                        path: "/protected/kontract",
                        element: <ContractsView/>,
                    },
                    {
                        path: "/protected/koszta",
                        element: <UtilityPage/>,
                    },
                    {
                        path: "/protected/wydatki",
                        element: <ExpensesTemplateView/>,
                    },
                    {
                        path: "/protected/statystyki",
                        element: <StatisticsPage/>,
                    },
                ],
            },
            {
                path: "/protected/v2",
                loader: async ({request}) => {
                    await enforceLogin(request);

                    return null;
                },
                element: <NewUiLayout/>,
                children: [
                    {
                        index: true,
                        path: "/protected/v2/dashboard",
                        element: <NewUiDashboardPage/>,
                    },
                    {
                        path: "/protected/v2/mieszkania",
                        element: <NewUiApartmentsPage/>,
                    },
                    {
                        path: "/protected/v2/kontrakty",
                        element: <NewUiContractsPage/>,
                    },
                    {
                        path: "/protected/v2/platnosci/wplaty",
                        element: <NewUiIncomePaymentsPage/>,
                    },
                    {
                        path: "/protected/v2/platnosci/koszty",
                        element: <NewUiExpensePaymentsPage/>,
                    },
                    {
                        path: "/protected/v2/szablony-kosztow",
                        element: <NewUiExpenseTemplatesPage/>,
                    },
                    {
                        path: "/protected/v2/osoby",
                        element: <NewUiPersonsPage/>,
                    },
                ],
            },
            {
                index: true,
                element: (
                    <Suspense>
                        <PublicPage/>
                    </Suspense>
                )
            }
        ]
    }
]);

async function enforceLogin(request: { url: string }): Promise<void | never> {
    const oidc = await getOidc();
    if (!oidc.isUserLoggedIn) {
        await oidc.login({
            // The loader function is invoked by react-router before the browser URL is updated to the target protected route URL.
            // Therefore, we need to specify where the user should be redirected after the login process completes.
            redirectUrl: request.url,

            // Explanation:
            // The 'doesCurrentHrefRequiresAuth' parameter informs oidc-spa whether it is acceptable to redirect the user to the current URL
            // if the user abandons the authentication process. This is crucial to prevent the user from being immediately redirected
            // back to the login page when pressing the back button from the login pages.
            // If the user navigated directly to the protected route (e.g., by clicking a link to your application from an external site),
            // then the current URL requires authentication.
            // Conversely, if the user navigated from an unprotected route within your application to the protected route,
            // then the current URL does not require authentication.
            doesCurrentHrefRequiresAuth: location.href === request.url
        });
        // Never here, the login method redirects the user to the identity provider.
    }
}
