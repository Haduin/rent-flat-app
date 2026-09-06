import {useQuery} from "@tanstack/react-query"
import {STATISTICS_QUERY_KEYS} from "../../../api/keys/statistics.ts";
import {client} from "../../../api/client.ts";
import type {ApartmentsStatisticsResponse} from "../../../api/generated";

export const useApartmentsStatistics = () => {
    return useQuery<ApartmentsStatisticsResponse>({
        queryFn: () => client.statisticsApi.getApartmentsStatistics(),
        queryKey: [STATISTICS_QUERY_KEYS.APARTMENTS_STATISTICS],
    })
}
