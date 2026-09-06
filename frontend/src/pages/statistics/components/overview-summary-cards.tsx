import {Card} from "primereact/card";
import {formatCurrency} from "../../../components/commons/currencyFormatter.ts";
import type {ApartmentsStatisticsOverviewDTO} from "../../../api/generated";

interface OverviewSummaryCardsProps {
    overview: ApartmentsStatisticsOverviewDTO;
}

interface StatTile {
    label: string;
    value: string;
    valueClassName?: string;
}

export const OverviewSummaryCards = ({overview}: OverviewSummaryCardsProps) => {
    const tiles: StatTile[] = [
        {label: "Mieszkania", value: `${overview.totalApartments}`},
        {
            label: "Pokoje (wynajęte / wolne / razem)",
            value: `${overview.totalOccupiedRooms} / ${overview.totalFreeRooms} / ${overview.totalRooms}`
        },
        {label: "Obłożenie", value: `${overview.overallOccupancyRatePercent.toFixed(1)}%`},
        {label: "Aktywny czynsz miesięczny", value: formatCurrency(overview.totalActiveMonthlyRent)},
        {label: "Wpłaty w tym miesiącu", value: formatCurrency(overview.currentMonthIncomeCollected)},
        {label: "Koszty w tym miesiącu", value: formatCurrency(overview.currentMonthCosts)},
        {
            label: "Wynik w tym miesiącu",
            value: formatCurrency(overview.netResultCurrentMonth),
            valueClassName: overview.netResultCurrentMonth >= 0 ? "text-green-600" : "text-red-600"
        },
        {label: "Wpłaty łącznie", value: formatCurrency(overview.totalIncomeCollectedAllTime)},
        {label: "Koszty łącznie", value: formatCurrency(overview.totalCostsAllTime)},
        {
            label: "Wynik łącznie",
            value: formatCurrency(overview.netResultAllTime),
            valueClassName: overview.netResultAllTime >= 0 ? "text-green-600" : "text-red-600"
        },
    ];

    return (
        <div className="flex flex-wrap gap-2 justify-content-center">
            {tiles.map((tile) => (
                <Card key={tile.label} className="w-15rem text-center">
                    <p className="text-sm text-color-secondary m-0">{tile.label}</p>
                    <p className={`text-xl font-bold m-0 ${tile.valueClassName ?? ""}`}>{tile.value}</p>
                </Card>
            ))}
        </div>
    );
};
