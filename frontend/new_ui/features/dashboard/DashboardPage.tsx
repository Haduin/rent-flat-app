import {ProgressSpinner} from "primereact/progressspinner";
import {useApartmentsStatistics} from "../../../src/pages/statistics/api/statistics.api.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {PageHeader} from "../../components/ui/PageHeader.tsx";
import {StatTile} from "../../components/ui/StatTile.tsx";
import {Card} from "../../components/ui/Card.tsx";
import {IconGrid, IconCard, IconTrendingUp, IconWallet} from "../../components/ui/icons.tsx";

const RoomDots = ({total, occupied}: { total: number; occupied: number }) => (
    <div style={{display: "flex", gap: 5}}>
        {Array.from({length: total}).map((_, index) => (
            <span
                key={index}
                style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    background: index < occupied ? "var(--ku-success)" : "var(--ku-neutral-soft)",
                    border: index < occupied ? "none" : "1px dashed var(--ku-border-strong)",
                }}
            />
        ))}
    </div>
);

const DashboardPage = () => {
    const {data, isLoading} = useApartmentsStatistics();

    if (isLoading || !data) {
        return (
            <div style={{display: "flex", justifyContent: "center", padding: 60}}>
                <ProgressSpinner/>
            </div>
        );
    }

    const {overview, apartments} = data;

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 28}}>
            <PageHeader
                title="Statystyki portfela"
                subtitle={`${overview.totalApartments} mieszkania · ${overview.totalRooms} pokoi · ${overview.totalOccupiedRooms} wynajętych`}
            />

            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16}}>
                <StatTile
                    label="Obłożenie pokoi"
                    value={`${overview.overallOccupancyRatePercent.toFixed(0)}%`}
                    caption={`${overview.totalOccupiedRooms} / ${overview.totalRooms} pokoi wynajętych`}
                    captionTone="success"
                    icon={<IconGrid size={14}/>}
                />
                <StatTile
                    label="Aktywny czynsz / mc"
                    value={formatCurrency(overview.totalActiveMonthlyRent)}
                    caption="suma aktywnych umów"
                    icon={<IconCard size={14}/>}
                />
                <StatTile
                    label="Wpłaty — ten miesiąc"
                    value={formatCurrency(overview.currentMonthIncomeCollected)}
                    caption="opłacone i częściowo opłacone"
                    captionTone="success"
                    icon={<IconTrendingUp size={14}/>}
                />
                <StatTile
                    label="Koszty — ten miesiąc"
                    value={formatCurrency(overview.currentMonthCosts)}
                    caption="media, podatki, czynsz właściciela"
                    captionTone="warning"
                    icon={<IconWallet size={14}/>}
                />
                <StatTile
                    label="Wynik netto — ten miesiąc"
                    value={formatCurrency(overview.netResultCurrentMonth)}
                    dark
                />
            </div>

            <div style={{display: "flex", flexDirection: "column", gap: 14}}>
                <h3 style={{fontSize: 15, fontWeight: 600, color: "var(--ku-text)"}}>Mieszkania</h3>
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14}}>
                    {apartments.map((apartment) => (
                        <Card key={apartment.apartmentId} padding={20}>
                            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14}}>
                                <h3 style={{fontSize: 15, fontWeight: 600}}>{apartment.apartmentName}</h3>
                                <span
                                    style={{
                                        fontSize: 11.5,
                                        fontWeight: 600,
                                        padding: "4px 10px",
                                        borderRadius: "var(--ku-radius-pill)",
                                        background:
                                            apartment.occupancyRatePercent >= 70
                                                ? "var(--ku-success-soft)"
                                                : "var(--ku-warning-soft)",
                                        color:
                                            apartment.occupancyRatePercent >= 70
                                                ? "var(--ku-success)"
                                                : "var(--ku-warning)",
                                    }}
                                >
                                    {apartment.occupancyRatePercent.toFixed(0)}% obłożenia
                                </span>
                            </div>
                            <div style={{marginBottom: 14}}>
                                <RoomDots total={apartment.totalRooms} occupied={apartment.occupiedRooms}/>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 13,
                                    paddingTop: 12,
                                    borderTop: "1px solid var(--ku-border)",
                                }}
                            >
                                <span style={{color: "var(--ku-text-secondary)"}}>Czynsz / mc</span>
                                <span style={{fontWeight: 600}}>{formatCurrency(apartment.activeMonthlyRent)}</span>
                            </div>
                            <div style={{display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 6}}>
                                <span style={{color: "var(--ku-text-secondary)"}}>Wynik netto (mc)</span>
                                <span
                                    style={{
                                        fontWeight: 600,
                                        color: apartment.netResultCurrentMonth >= 0 ? "var(--ku-success)" : "var(--ku-danger)",
                                    }}
                                >
                                    {formatCurrency(apartment.netResultCurrentMonth)}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
