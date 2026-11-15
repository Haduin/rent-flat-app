import {useMemo, useRef, useState} from "react";
import {useSearchParams} from "react-router";
import {confirmDanger} from "../../components/ui/confirm.ts";
import {getApartments, SaveNameTarget, useDeleteRoom, useSaveApartmentOrRoomName} from "../../../src/pages/apartment/api/apartments.api.ts";
import {useContractsQuery} from "../../../src/pages/contracts/api/contracts.api.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {Page} from "../../components/layout/Page.tsx";
import {Section} from "../../components/layout/Section.tsx";
import {Stack} from "../../components/layout/Stack.tsx";
import {Grid} from "../../components/layout/Grid.tsx";
import {Card} from "../../components/ui/Card.tsx";
import {Heading} from "../../components/ui/Heading.tsx";
import {Text} from "../../components/ui/Text.tsx";
import {DetailList} from "../../components/form/DetailList.tsx";
import {Button} from "../../components/ui/Button.tsx";
import {IconPlus} from "../../components/ui/icons.tsx";
import type {ApartmentWithRooms} from "../../../src/api/generated";
import {NameDialog} from "./NameDialog.tsx";
import {isNotNullable} from "../../../src/utils/typeguards";
import {Badge} from "../../components/ui/Badge.tsx";
import {QueryError} from "../../components/ui/QueryError.tsx";
import {PageLoading} from "../../components/ui/PageLoading.tsx";
import {pluralPl, ROOM_FORMS} from "../../utils/plural.ts";

const OCCUPANCY_HEALTHY_RATIO = 0.7;
/** Below this width the detail sits under the list (matches .ku-split-layout in components.css). */
const STACKED_LAYOUT_QUERY = "(max-width: 860px)";

interface NameEdit {
    target: SaveNameTarget;
    currentName: string;
}

const nameDialogTexts = ({target, currentName}: NameEdit) => {
    if ("apartment" === target.kind) {
        return {title: "" === currentName ? "Nowe mieszkanie" : "Zmień nazwę mieszkania", label: "Nazwa mieszkania"};
    }
    return {title: "" === currentName ? "Nowy pokój" : "Zmień nazwę pokoju", label: "Nazwa pokoju"};
};

interface RoomOccupant {
    tenantName: string | null;
    rent: number | null;
}

const ApartmentsPage = () => {
    const apartmentsQuery = getApartments({enabled: true});
    const contractsQuery = useContractsQuery();
    const apartments = apartmentsQuery.data;
    const contracts = contractsQuery.data;
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedApartmentId = Number(searchParams.get("mieszkanie")) || null;
    const detailRef = useRef<HTMLDivElement>(null);
    const selectApartment = (apartmentId: number) => {
        setSearchParams({mieszkanie: String(apartmentId)}, {replace: true});
        if (window.matchMedia(STACKED_LAYOUT_QUERY).matches) {
            requestAnimationFrame(() => detailRef.current?.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"}));
        }
    };
    const [nameEdit, setNameEdit] = useState<NameEdit | null>(null);
    const deleteRoom = useDeleteRoom();
    const confirmDeleteRoom = (apartmentId: number, roomId: number, roomName: string) =>
        confirmDanger({
            title: `Usunąć pokój ${roomName}?`,
            message: "Pokój zniknie z mieszkania. Pokoju z umowami lub kosztami nie da się usunąć.",
            confirmLabel: "Usuń pokój",
            onConfirm: () => deleteRoom.mutate({apartmentId, roomId}),
        });
    const saveName = useSaveApartmentOrRoomName({
        onSuccess: (createdApartmentId) => {
            if (isNotNullable(createdApartmentId)) selectApartment(createdApartmentId);
            setNameEdit(null);
        },
    });

    const occupancyByRoomId = useMemo(() => {
        const map = new Map<number, RoomOccupant>();
        contracts
            ?.filter((contract) => "ACTIVE" === contract.status && contract.room)
            .forEach((contract) => {
                map.set(contract.room!.id, {
                    tenantName: `${contract.person?.firstName ?? ""} ${contract.person?.lastName ?? ""}`.trim(),
                    rent: contract.amount ?? null,
                });
            });
        return map;
    }, [contracts]);

    const apartmentSummaries = useMemo(() => {
        return (apartments ?? []).map((apartment) => {
            const occupied = apartment.rooms.filter((room) => occupancyByRoomId.has(room.roomId)).length;
            const totalRent = apartment.rooms.reduce((sum, room) => sum + (occupancyByRoomId.get(room.roomId)?.rent ?? 0), 0);
            return {apartment, occupied, totalRent};
        });
    }, [apartments, occupancyByRoomId]);

    const selected: ApartmentWithRooms | undefined =
        apartments?.find((apartment) => apartment.apartmentId === selectedApartmentId) ?? apartments?.[0];

    if (apartmentsQuery.isError || contractsQuery.isError) {
        return (
            <QueryError
                message="Nie udało się wczytać mieszkań."
                error={apartmentsQuery.error ?? contractsQuery.error}
                onRetry={() => {
                    apartmentsQuery.refetch();
                    contractsQuery.refetch();
                }}
            />
        );
    }
    if (apartmentsQuery.isLoading || contractsQuery.isLoading || !apartments) {
        return <PageLoading label="Wczytywanie mieszkań"/>;
    }

    return (
        <Page
            title="Mieszkania"
            actions={
                <Button
                    variant="primary"
                    icon={<IconPlus size={15}/>}
                    onClick={() => setNameEdit({target: {kind: "apartment"}, currentName: ""})}
                >
                    Dodaj mieszkanie
                </Button>
            }
        >
            <div className="ku-split-layout">
                <Stack gap="3">
                    {apartmentSummaries.map(({apartment, occupied, totalRent}) => {
                        const isSelected = selected?.apartmentId === apartment.apartmentId;
                        const healthy = apartment.rooms.length > 0 && occupied / apartment.rooms.length >= OCCUPANCY_HEALTHY_RATIO;
                        return (
                            <Card key={apartment.apartmentId} padding="none" highlighted={isSelected}>
                                <button
                                    type="button"
                                    className="ku-select-card"
                                    aria-pressed={isSelected}
                                    onClick={() => selectApartment(apartment.apartmentId)}
                                >
                                    <Stack gap="4">
                                        <Stack direction="row" justify="space-between" align="flex-start" gap="3">
                                            <Heading level={2}>{apartment.apartmentName}</Heading>
                                            <Badge tone={0 === apartment.rooms.length ? "neutral" : healthy ? "success" : "warning"}>
                                                {occupied}/{apartment.rooms.length} zajęte
                                            </Badge>
                                        </Stack>
                                        <DetailList variant="footer" items={[{label: "Czynsz łącznie", value: `${formatCurrency(totalRent)} / mc`}]}/>
                                    </Stack>
                                </button>
                            </Card>
                        );
                    })}
                </Stack>

                {0 === apartments.length && (
                    <Card padding="lg">
                        <Text as="p" tone="secondary">
                            Nie masz jeszcze żadnego mieszkania. Dodaj pierwsze przyciskiem „Dodaj mieszkanie”.
                        </Text>
                    </Card>
                )}

                {selected && (
                    <div ref={detailRef} className="ku-scroll-target">
                        <Card padding="lg">
                            <Section
                                title={selected.apartmentName}
                                size="xl"
                                subtitle={pluralPl(selected.rooms.length, ROOM_FORMS)}
                                actions={
                                    <>
                                        <Button
                                            variant="secondary"
                                            icon="pi pi-pencil"
                                            onClick={() => setNameEdit({
                                                target: {kind: "apartment", apartmentId: selected.apartmentId},
                                                currentName: selected.apartmentName,
                                            })}
                                        >
                                            Zmień nazwę
                                        </Button>
                                        <Button
                                            icon={<IconPlus size={15}/>}
                                            onClick={() => setNameEdit({
                                                target: {kind: "room", apartmentId: selected.apartmentId},
                                                currentName: "",
                                            })}
                                        >
                                            Dodaj pokój
                                        </Button>
                                    </>
                                }
                            >
                                <Section title="Pokoje" level={3}>
                                    {0 === selected.rooms.length && (
                                        <Text as="p" tone="secondary" size="base">To mieszkanie nie ma jeszcze pokoi.</Text>
                                    )}
                                    <Grid min="180px" gap="2">
                                        {selected.rooms.map((room) => {
                                            const occupant = occupancyByRoomId.get(room.roomId);
                                            return (
                                                <Card key={room.roomId} padding="sm" dashed={!occupant}>
                                                    <Stack gap="2">
                                                        <Stack direction="row" justify="space-between" align="center">
                                                            <Stack direction="row" align="center" gap="2">
                                                                <Text weight="semibold" size="base">{room.roomName}</Text>
                                                                {occupant && <span className="ku-occupied-dot" aria-hidden="true"/>}
                                                            </Stack>
                                                            <Stack direction="row" gap="0-5">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="small"
                                                                    icon="pi pi-pencil"
                                                                    aria-label={`Zmień nazwę pokoju ${room.roomName}`}
                                                                    onClick={() => setNameEdit({
                                                                        target: {kind: "room", apartmentId: selected.apartmentId, roomId: room.roomId},
                                                                        currentName: room.roomName,
                                                                    })}
                                                                />
                                                                {!occupant && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="small"
                                                                        icon="pi pi-trash"
                                                                        className="p-button-danger"
                                                                        aria-label={`Usuń pokój ${room.roomName}`}
                                                                        onClick={() => confirmDeleteRoom(selected.apartmentId, room.roomId, room.roomName)}
                                                                    />
                                                                )}
                                                            </Stack>
                                                        </Stack>
                                                        {occupant ? (
                                                            <Stack gap="0-5">
                                                                <Text tone="secondary" size="sm">{occupant.tenantName}</Text>
                                                                <Text tone="secondary" size="sm">{occupant.rent != null ? formatCurrency(occupant.rent) : ""}</Text>
                                                            </Stack>
                                                        ) : (
                                                            <Text tone="muted" size="xs">wolny</Text>
                                                        )}
                                                    </Stack>
                                                </Card>
                                            );
                                        })}
                                    </Grid>
                                </Section>
                            </Section>
                        </Card>
                    </div>
                )}
            </div>

            {nameEdit && (
                <NameDialog
                    visible
                    {...nameDialogTexts(nameEdit)}
                    initialName={nameEdit.currentName}
                    saving={saveName.isPending}
                    onSave={(name) => saveName.mutate({target: nameEdit.target, name})}
                    onHide={() => setNameEdit(null)}
                />
            )}
        </Page>
    );
};

export default ApartmentsPage;
