import {getOidc} from "../oidc";
import {
    ApartmentsApi,
    BaseAPI,
    Configuration,
    ContractsApi,
    ExpensesApi,
    ExpenseTemplatesApi,
    PaymentsApi,
    PersonsApi,
    RoomsApi,
    StatisticsApi
} from './generated'

class ApiClientFactory {
    private static config = new Configuration({
        basePath: import.meta.env.VITE_BACKEND_URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        middleware: [
            {
                post: async (context) => context.response,
                pre: async (context) => {
                    const oidc = await getOidc();
                    // @ts-expect-error
                    const accessToken = await oidc.getAccessToken();
                    return {
                        ...context,
                        init: {
                            ...context.init,
                            headers: {
                                ...context.init.headers,
                                Authorization: `Bearer ${accessToken}`,
                            },
                        },
                    };
                },
            },
        ],

    })

    static build<T extends BaseAPI>(ApiClass: new (configuration: Configuration) => T) {
        return new ApiClass(ApiClientFactory.config);
    }
}

// miejsce na custom logike do request np

export const client = {
    roomsApi: ApiClientFactory.build(RoomsApi),
    contractsApi: ApiClientFactory.build(ContractsApi),
    paymentsApi: ApiClientFactory.build(PaymentsApi),
    personApi: ApiClientFactory.build(PersonsApi),
    expensesApi: ApiClientFactory.build(ExpensesApi),
    expenseTemplatesApi: ApiClientFactory.build(ExpenseTemplatesApi),
    apartmentApi: ApiClientFactory.build(ApartmentsApi),
    statisticsApi: ApiClientFactory.build(StatisticsApi),
}