import {Link} from "react-router";
import {useApartmentsStatistics} from "../../../src/pages/statistics/api/statistics.api.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {Page} from "../../components/layout/Page.tsx";
import {StatTile} from "../../components/ui/StatTile.tsx";
import {Section} from "../../components/layout/Section.tsx";
import {Stack} from "../../components/layout/Stack.tsx";
import {Grid} from "../../components/layout/Grid.tsx";
import {Card} from "../../components/ui/Card.tsx";
import {Heading} from "../../components/ui/Heading.tsx";
import {Text} from "../../components/ui/Text.tsx";
import {DetailList} from "../../components/form/DetailList.tsx";
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
    <div className="ku-room-dots" role="img" aria-label={`${occupied} z ${total} pokoi wynajętych`}>
        {Array.from({length: total}).map((_, index) => (
            <span key={index} className={index < occupied ? "ku-room-dot ku-room-dot-occupied" : "ku-room-dot"}/>
        ))}
    </div>
);

const DashboardPage = () => {
    const {data, isLoading, isError, error, refetch} = useApartmentsStatistics();

    if (isError) {
        return <QueryError message="Nie udało się wczytać statystyk." error={error} onRetry={() => refetch()}/>;
    }
    if (isLoading || !data) {
        return <PageLoading label="Wczytywanie statystyk"/>;
    }

    const {overview, apartments} = data;
    const netNegative = overview.netResultCurrentMonth < 0;

    return (
        <Page
            title="Statystyki portfela"
            subtitle={`${pluralPl(overview.totalApartments, APARTMENT_FORMS)} · ${pluralPl(overview.totalRooms, ROOM_FORMS)} · ${overview.totalOccupiedRooms} wynajętych`}
        >
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

            <Section title="Mieszkania">
                <Grid min="320px">
                    {apartments.map((apartment) => (
                        <Link
                            key={apartment.apartmentId}
                            to={`/protected/v2/mieszkania?mieszkanie=${apartment.apartmentId}`}
                            className="ku-tile-link"
                        >
                            <Card padding="md">
                                <Stack gap="4">
                                    <Stack direction="row" justify="space-between" align="flex-start" gap="3">
                                        <Heading level={3} size="md">{apartment.apartmentName}</Heading>
                                        <Badge tone={occupancyTone(apartment.totalRooms, apartment.occupancyRatePercent)}>
                                            {apartment.occupancyRatePercent.toFixed(0)}% obłożenia
                                        </Badge>
                                    </Stack>
                                    <RoomDots total={apartment.totalRooms} occupied={apartment.occupiedRooms}/>
                                    <DetailList
                                        variant="footer"
                                        items={[
                                            {label: "Czynsz / mc", value: formatCurrency(apartment.activeMonthlyRent)},
                                            {
                                                label: "Wynik netto (mc)",
                                                value: (
                                                    <Text tone={apartment.netResultCurrentMonth >= 0 ? "success" : "danger"} weight="semibold">
                                                        {formatCurrency(apartment.netResultCurrentMonth)}
                                                    </Text>
                                                ),
                                            },
                                        ]}
                                    />
                                </Stack>
                            </Card>
                        </Link>
                    ))}
                </Grid>
            </Section>
        </Page>
    );
};

export default DashboardPage;
