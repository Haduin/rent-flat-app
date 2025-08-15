import {lazy, Suspense} from "react";
import {createBrowserRouter} from "react-router";
import {Layout} from "./Layout";
import {getOidc} from "../oidc.tsx";
import ApartmentPage from "../pages/apartment/apartment-page.tsx";
import {UtilityPage} from "../pages/utility/utility-page.tsx";

const PublicPage = lazy(() => import("../pages/PublicPage"));
const NavigationComponent = lazy(() => import("../pages/NavigationComponent.tsx"));
const HomePage = lazy(() => import ("../pages/home/home-page.tsx"))
const ApartmentsPage = lazy(() => import ("../pages/apartment/apartments-page.tsx"))
const PersonTable = lazy(() => import ("../pages/person/person-table.tsx"))
const PaymentsView = lazy(() => import ("../pages/payments/payments-view.tsx"))
const PaymentSummary = lazy(() => import ("../pages/payments/payment-summary/payment-summary.tsx"))
const ContractsView = lazy(() => import ("../pages/contracts/contracts-view.tsx"))


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
                        path: "/protected/platnosci/podsumowanie",
                        element: <PaymentSummary/>,
                    },
                    {
                        path: "/protected/kontract",
                        element: <ContractsView/>,
                    },
                    {
                        path: "/protected/koszta",
                        element: <UtilityPage/>,
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
