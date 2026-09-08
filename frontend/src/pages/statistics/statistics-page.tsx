import {Card} from "primereact/card";
import {ProgressSpinner} from "primereact/progressspinner";
import {useApartmentsStatistics} from "./api/statistics.api.ts";
import {OverviewSummaryCards} from "./components/overview-summary-cards.tsx";
import {ApartmentStatisticsCard} from "./components/apartment-statistics-card.tsx";

const StatisticsPage = () => {
    const {data, isLoading} = useApartmentsStatistics();

    return (
        <Card className="mt-2">
            <h1>Statystyki</h1>

            {isLoading || !data ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div className="flex flex-column gap-4">
                    <OverviewSummaryCards overview={data.overview}/>

                    <div className="flex flex-wrap gap-3 justify-content-center">
                        {data.apartments.map((apartmentStatistics) => (
                            <ApartmentStatisticsCard
                                key={apartmentStatistics.apartmentId}
                                statistics={apartmentStatistics}
                            />
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default StatisticsPage;
