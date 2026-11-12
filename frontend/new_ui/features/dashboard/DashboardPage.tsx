import {Link} from "react-router";
import {useApartmentsStatistics} from "../../../src/pages/statistics/api/statistics.api.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {PageHeader} from "../../components/ui/PageHeader.tsx";
import {StatTile} from "../../components/ui/StatTile.tsx";
import {Card} from "../../components/ui/Card.tsx";
import {Badge, BadgeTone} from "../../components/ui/Badge.tsx";
import {QueryError} from "../../components/ui/QueryError.tsx";
import {PageLoading} from "../../components/ui/PageLoading.tsx";
import {APARTMENT_FORMS, pluralPl, ROOM_FORMS} from "../../utils/plural.ts";
import {IconGrid, IconCard, IconTrendingUp, IconWallet} from "../../components/ui/icons.tsx";
import {isEqual} from "../../../src/utils/typeguards";

const OCCUPANCY_HEALTHY_PERCENT = 70;

const occupancyTone = (rooms: number, percent: number): Extract<BadgeTone, "success" | "warning" | "neutral"> => {
    if (isEqual(0, rooms)) return "neutral";
    return percent >= OCCUPANCY_HEALTHY_PERCENT ? "success" : "warning";
};

const RoomDots = ({total, occupied}: { total: number; occupied: number }) => (
    <div style={{display: "flex", flexWrap: "wrap", gap: 5}} role="img" aria-label={`${occupied} z ${total} pokoi wynajętych`}>
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
    const {data, isLoading, isError, refetch} = useApartmentsStatistics();

    if (isError) {
        return <QueryError message="Nie udało się wczytać statystyk." onRetry={() => refetch()}/>;
    }
    if (isLoading || !data) {
        return <PageLoading label="Wczytywanie statystyk"/>;
    }

    const {overview, apartments} = data;
    const netNegative = overview.netResultCurrentMonth < 0;

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 28}}>
            <PageHeader
                title="Statystyki portfela"
                subtitle={`${pluralPl(overview.totalApartments, APARTMENT_FORMS)} · ${pluralPl(overview.totalRooms, ROOM_FORMS)} · ${overview.totalOccupiedRooms} wynajętych`}
            />

            <div className="ku-stat-grid">
                <StatTile
                    label="Obłożenie pokoi"
                    value={`${overview.overallOccupancyRatePercent.toFixed(0)}%`}
                    caption={`${overview.totalOccupiedRooms} / ${overview.totalRooms} pokoi wynajętych`}
                    captionTone={occupancyTone(overview.totalRooms, overview.overallOccupancyRatePercent)}
                    icon={<IconGrid size={14}/>}
                    to="/protected/v2/mieszkania"
                />
                <StatTile
                    label="Aktywny czynsz / mc"
                    value={formatCurrency(overview.totalActiveMonthlyRent)}
                    caption="suma aktywnych umów"
                    icon={<IconCard size={14}/>}
                    to="/protected/v2/kontrakty"
                />
                <StatTile
                    label="Wpłaty — ten miesiąc"
                    value={formatCurrency(overview.currentMonthIncomeCollected)}
                    caption="opłacone i częściowo opłacone"
                    icon={<IconTrendingUp size={14}/>}
                    to="/protected/v2/platnosci/wplaty"
                />
                <StatTile
                    label="Koszty — ten miesiąc"
                    value={formatCurrency(overview.currentMonthCosts)}
                    caption="media, podatki, czynsz właściciela"
                    icon={<IconWallet size={14}/>}
                    to="/protected/v2/platnosci/koszty"
                />
                <StatTile
                    label="Wynik netto — ten miesiąc"
                    value={formatCurrency(overview.netResultCurrentMonth)}
                    caption={netNegative ? "wpłaty − koszty · na minusie" : "wpłaty − koszty"}
                    captionTone={netNegative ? "danger" : "neutral"}
                    dark
                />
            </div>

            <div style={{display: "flex", flexDirection: "column", gap: 14}}>
                <h2 style={{fontSize: 15, fontWeight: 600, color: "var(--ku-text)"}}>Mieszkania</h2>
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14}}>
                    {apartments.map((apartment) => (
                        <Link
                            key={apartment.apartmentId}
                            to={`/protected/v2/mieszkania?mieszkanie=${apartment.apartmentId}`}
                            className="ku-tile-link"
                        >
                        <Card padding={20}>
                            <div style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14}}>
                                <h3 style={{fontSize: 15, fontWeight: 600}}>{apartment.apartmentName}</h3>
                                <Badge tone={occupancyTone(apartment.totalRooms, apartment.occupancyRatePercent)}>
                                    {apartment.occupancyRatePercent.toFixed(0)}% obłożenia
                                </Badge>
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
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
