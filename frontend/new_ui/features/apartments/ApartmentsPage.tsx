import {useMemo, useRef, useState} from "react";
import {useSearchParams} from "react-router";
import {confirmDialog} from "primereact/confirmdialog";
import {getApartments, SaveNameTarget, useDeleteRoom, useSaveApartmentOrRoomName} from "../../../src/pages/apartment/api/apartments.api.ts";
import {useContractsQuery} from "../../../src/pages/contracts/api/contracts.api.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {PageHeader} from "../../components/ui/PageHeader.tsx";
import {Card} from "../../components/ui/Card.tsx";
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
/** Below this width the detail sits under the list (matches .ku-split-layout in tokens.css). */
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
            requestAnimationFrame(() => detailRef.current?.scrollIntoView({behavior: "smooth", block: "start"}));
        }
    };
    const [nameEdit, setNameEdit] = useState<NameEdit | null>(null);
    const deleteRoom = useDeleteRoom();
    const confirmDeleteRoom = (apartmentId: number, roomId: number, roomName: string) =>
        confirmDialog({
            header: `Usunąć pokój ${roomName}?`,
            message: "Pokój zniknie z mieszkania. Pokoju z umowami lub kosztami nie da się usunąć.",
            defaultFocus: "reject",
            acceptLabel: "Usuń pokój",
            rejectLabel: "Anuluj",
            acceptClassName: "p-button-danger",
            accept: () => deleteRoom.mutate({apartmentId, roomId}),
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
        <div style={{display: "flex", flexDirection: "column", gap: 24}}>
            <PageHeader
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
            />

            <div className="ku-split-layout">
                <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                    {apartmentSummaries.map(({apartment, occupied, totalRent}) => {
                        const isSelected = selected?.apartmentId === apartment.apartmentId;
                        const healthy = apartment.rooms.length > 0 && occupied / apartment.rooms.length >= OCCUPANCY_HEALTHY_RATIO;
                        return (
                            <Card key={apartment.apartmentId} padding={0} highlighted={isSelected}>
                                <button
                                    type="button"
                                    className="ku-select-card"
                                    aria-pressed={isSelected}
                                    onClick={() => selectApartment(apartment.apartmentId)}
                                >
                                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12}}>
                                        <h2 style={{fontSize: 16, fontWeight: 600}}>{apartment.apartmentName}</h2>
                                        <Badge tone={0 === apartment.rooms.length ? "neutral" : healthy ? "success" : "warning"}>
                                            {occupied}/{apartment.rooms.length} zajęte
                                        </Badge>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: 13,
                                            marginTop: 14,
                                            paddingTop: 12,
                                            borderTop: "1px solid var(--ku-border)",
                                        }}
                                    >
                                        <span style={{color: "var(--ku-text-secondary)"}}>Czynsz łącznie</span>
                                        <span style={{fontWeight: 600}}>{formatCurrency(totalRent)} / mc</span>
                                    </div>
                                </button>
                            </Card>
                        );
                    })}
                </div>

                {0 === apartments.length && (
                    <Card padding={28}>
                        <p style={{margin: 0, color: "var(--ku-text-secondary)"}}>
                            Nie masz jeszcze żadnego mieszkania. Dodaj pierwsze przyciskiem „Dodaj mieszkanie”.
                        </p>
                    </Card>
                )}

                {selected && (
                    <div ref={detailRef} style={{scrollMarginTop: 16}}>
                    <Card padding={28}>
                        <div style={{display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 22}}>
                            <div>
                                <h2 style={{fontSize: 20, fontWeight: 700}}>{selected.apartmentName}</h2>
                                <div style={{fontSize: 13, color: "var(--ku-text-secondary)", marginTop: 4}}>
                                    {pluralPl(selected.rooms.length, ROOM_FORMS)}
                                </div>
                            </div>
                            <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
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
                            </div>
                        </div>

                        <h3 style={{fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--ku-text)"}}>Pokoje</h3>
                        {0 === selected.rooms.length && (
                            <p style={{margin: 0, color: "var(--ku-text-secondary)", fontSize: 13.5}}>
                                To mieszkanie nie ma jeszcze pokoi.
                            </p>
                        )}
                        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10}}>
                            {selected.rooms.map((room) => {
                                const occupant = occupancyByRoomId.get(room.roomId);
                                return (
                                    <div
                                        key={room.roomId}
                                        style={{
                                            border: occupant ? "1px solid var(--ku-border)" : "1px dashed var(--ku-border-strong)",
                                            borderRadius: "var(--ku-radius-sm)",
                                            padding: 14,
                                        }}
                                    >
                                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                            <span style={{display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14}}>
                                                {room.roomName}
                                                {occupant && (
                                                    <span
                                                        style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: "var(--ku-radius-pill)",
                                                            background: "var(--ku-success)",
                                                        }}
                                                    />
                                                )}
                                            </span>
                                            <span style={{display: "flex"}}>
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
                                            </span>
                                        </div>
                                        {occupant ? (
                                            <>
                                                <div style={{fontSize: 12.5, color: "var(--ku-text-secondary)", marginTop: 6}}>
                                                    {occupant.tenantName}
                                                </div>
                                                <div style={{fontSize: 12.5, color: "var(--ku-text-secondary)"}}>
                                                    {occupant.rent != null ? formatCurrency(occupant.rent) : ""}
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{fontSize: 12, color: "var(--ku-text-muted)", marginTop: 6}}>wolny</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
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
        </div>
    );
};

export default ApartmentsPage;
