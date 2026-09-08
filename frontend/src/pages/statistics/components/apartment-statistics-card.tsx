import {Card} from "primereact/card";
import {Tag} from "primereact/tag";
import {formatCurrency} from "../../../components/commons/currencyFormatter.ts";
import type {ApartmentStatisticsDTO} from "../../../api/generated";

interface ApartmentStatisticsCardProps {
    statistics: ApartmentStatisticsDTO;
}

interface StatRowProps {
    label: string;
    value: string;
    valueClassName?: string;
}

const StatRow = ({label, value, valueClassName}: StatRowProps) => (
    <div className="flex justify-content-between gap-3">
        <span className="text-color-secondary">{label}</span>
        <span className={`font-medium ${valueClassName ?? ""}`}>{value}</span>
    </div>
);

export const ApartmentStatisticsCard = ({statistics}: ApartmentStatisticsCardProps) => {
    const netAllTimeClass = statistics.netResultAllTime >= 0 ? "text-green-600" : "text-red-600";
    const netCurrentMonthClass = statistics.netResultCurrentMonth >= 0 ? "text-green-600" : "text-red-600";

    return (
        <Card
            className="w-full md:w-30rem"
            title={statistics.apartmentName}
            subTitle={`Obłożenie: ${statistics.occupancyRatePercent.toFixed(0)}%`}
        >
            <div className="flex flex-column gap-2">
                <div className="flex align-items-center gap-2 mb-2">
                    <Tag
                        severity={statistics.occupiedRooms > 0 ? "success" : "warning"}
                        value={`${statistics.occupiedRooms} / ${statistics.totalRooms} pokoi wynajętych`}
                    />
                    <Tag severity="info" value={`${statistics.freeRooms} wolnych`}/>
                </div>

                <StatRow label="Aktywne umowy" value={`${statistics.activeContractsCount}`}/>
                <StatRow label="Umowy w historii" value={`${statistics.totalContractsCount}`}/>
                <StatRow label="Aktywny czynsz miesięczny" value={formatCurrency(statistics.activeMonthlyRent)}/>
                <StatRow label="Średni czynsz (wynajęty pokój)"
                         value={formatCurrency(statistics.averageRentPerOccupiedRoom)}/>
                <StatRow label="Średni czynsz (historia umów)"
                         value={formatCurrency(statistics.averageRentAllContracts)}/>

                <hr className="w-full border-none border-top-1 surface-border my-1"/>

                <StatRow label="Wpłaty w tym miesiącu" value={formatCurrency(statistics.currentMonthIncomeCollected)}/>
                <StatRow label="Koszty w tym miesiącu" value={formatCurrency(statistics.currentMonthCosts)}/>
                <StatRow
                    label="Wynik w tym miesiącu"
                    value={formatCurrency(statistics.netResultCurrentMonth)}
                    valueClassName={netCurrentMonthClass}
                />

                <hr className="w-full border-none border-top-1 surface-border my-1"/>

                <StatRow label="Wpłaty łącznie" value={formatCurrency(statistics.totalIncomeCollected)}/>
                <StatRow label="Koszty łącznie" value={formatCurrency(statistics.totalCosts)}/>
                <StatRow label="Średni koszt miesięczny" value={formatCurrency(statistics.averageMonthlyCost)}/>
                <StatRow
                    label="Wynik łącznie"
                    value={formatCurrency(statistics.netResultAllTime)}
                    valueClassName={netAllTimeClass}
                />
            </div>
        </Card>
    );
};
