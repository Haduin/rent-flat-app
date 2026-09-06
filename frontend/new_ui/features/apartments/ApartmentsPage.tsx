import {useMemo, useState} from "react";
import {ProgressSpinner} from "primereact/progressspinner";
import {getApartments} from "../../../src/pages/apartment/api/apartments.api.ts";
import {useContractsQuery} from "../../../src/pages/contracts/api/contracts.api.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {PageHeader} from "../../components/ui/PageHeader.tsx";
import {Card} from "../../components/ui/Card.tsx";
import {Button} from "../../components/ui/Button.tsx";
import {IconPlus} from "../../components/ui/icons.tsx";
import type {ApartmentWithRooms} from "../../../src/api/generated";

interface RoomOccupant {
    tenantName: string | null;
    rent: number | null;
}

const ApartmentsPage = () => {
    const {data: apartments, isLoading: apartmentsLoading} = getApartments({enabled: true});
    const {data: contracts, isLoading: contractsLoading} = useContractsQuery();
    const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null);

    const occupancyByRoomId = useMemo(() => {
        const map = new Map<number, RoomOccupant>();
        contracts
            ?.filter((contract) => contract.status === "ACTIVE" && contract.room)
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

    const isLoading = apartmentsLoading || contractsLoading;

    if (isLoading || !apartments) {
        return (
            <div style={{display: "flex", justifyContent: "center", padding: 60}}>
                <ProgressSpinner/>
            </div>
        );
    }

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 24}}>
            <PageHeader
                title="Mieszkania"
                actions={
                    <Button variant="primary" icon={<IconPlus size={15}/>}>
                        Dodaj mieszkanie
                    </Button>
                }
            />

            <div className="ku-split-layout">
                <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                    {apartmentSummaries.map(({apartment, occupied, totalRent}) => {
                        const isSelected = (selected?.apartmentId ?? apartments[0]?.apartmentId) === apartment.apartmentId;
                        return (
                            <Card
                                key={apartment.apartmentId}
                                padding={18}
                                highlighted={isSelected}
                                style={{cursor: "pointer"}}
                            >
                                <div onClick={() => setSelectedApartmentId(apartment.apartmentId)}>
                                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                                        <h3 style={{fontSize: 16, fontWeight: 600}}>{apartment.apartmentName}</h3>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                padding: "4px 9px",
                                                borderRadius: "var(--ku-radius-pill)",
                                                background:
                                                    apartment.rooms.length > 0 && occupied / apartment.rooms.length >= 0.7
                                                        ? "var(--ku-success-soft)"
                                                        : "var(--ku-warning-soft)",
                                                color:
                                                    apartment.rooms.length > 0 && occupied / apartment.rooms.length >= 0.7
                                                        ? "var(--ku-success)"
                                                        : "var(--ku-warning)",
                                            }}
                                        >
                                            {occupied}/{apartment.rooms.length} zajęte
                                        </span>
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
                                </div>
                            </Card>
                        );
                    })}

                    <div
                        style={{
                            border: "1.5px dashed var(--ku-border-strong)",
                            borderRadius: "var(--ku-radius-md)",
                            padding: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            color: "var(--ku-text-muted)",
                            fontSize: 13.5,
                            fontWeight: 500,
                        }}
                    >
                        <IconPlus size={15}/>
                        Nowe mieszkanie
                    </div>
                </div>

                {selected && (
                    <Card padding={28}>
                        <div style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22}}>
                            <div>
                                <h2 style={{fontSize: 20, fontWeight: 700}}>{selected.apartmentName}</h2>
                                <div style={{fontSize: 13, color: "var(--ku-text-secondary)", marginTop: 4}}>
                                    {selected.rooms.length} pokoi
                                </div>
                            </div>
                            <Button icon={<IconPlus size={15}/>}>Dodaj pokój</Button>
                        </div>

                        <h3 style={{fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--ku-text)"}}>Pokoje</h3>
                        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10}}>
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
                                            <span style={{fontWeight: 600, fontSize: 14}}>{room.roomName}</span>
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
                )}
            </div>
        </div>
    );
};

export default ApartmentsPage;
