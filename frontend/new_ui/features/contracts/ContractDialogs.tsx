import {useEffect} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Timeline} from "primereact/timeline";
import {FormDialog} from "../../components/form/FormDialog.tsx";
import {InfoDialog} from "../../components/form/InfoDialog.tsx";
import {DetailList} from "../../components/form/DetailList.tsx";
import {AmountField, CheckboxField, DateField, IntegerField, SelectField, TextAreaField} from "../../components/form/fields.tsx";
import {dateNotBefore, dayOfMonth, nonNegativeAmount, positiveAmount, requiredDate} from "../../components/form/schemas.ts";
import {Badge} from "../../components/ui/Badge.tsx";
import {PageLoading} from "../../components/ui/PageLoading.tsx";
import {formatDatePl, parseIsoDate} from "../../utils/date.ts";
import {contractStatus, roomLabel, tenantName} from "./contract-status.ts";
import {useContractHistoryQuery, useFetchRooms, useUnassignedRooms} from "../../../src/pages/contracts/api/contracts.api.ts";
import {dateToStringFullYearMouthDay} from "../../../src/components/commons/dateFormatter.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import type {DeleteContractDTO, NewContract} from "../../../src/components/commons/types.ts";
import type {ContractDTO, ContractHistoryDTO, PersonDTO, UpdateContractDetails} from "../../../src/api/generated";
import {isEqual, isNotNullable, isNull} from "../../../src/utils/typeguards";

const money = (value: number | null | undefined) => (isNotNullable(value) ? formatCurrency(value) : "—");
const toIso = (date: Date | null) => (isNull(date) ? "" : dateToStringFullYearMouthDay(date));

const contractTermsSchema = {
    startDate: requiredDate("Data rozpoczęcia jest wymagana"),
    endDate: dateNotBefore("startDate", "Koniec nie może być przed początkiem umowy"),
    amount: positiveAmount("Czynsz jest wymagany"),
    deposit: nonNegativeAmount("Kaucja jest wymagana (0, jeśli brak)"),
    payDay: dayOfMonth("Dzień płatności jest wymagany"),
    roomId: Yup.number().nullable().required("Wybierz pokój"),
};

interface ContractTermsValues {
    roomId: number | null;
    startDate: Date | null;
    endDate: Date | null;
    amount: number | null;
    deposit: number | null;
    payDay: number | null;
}

const PAY_DAY_HINT = "Do którego dnia miesiąca najemca płaci czynsz";

export const AddContractDialog = ({unassignedPersons, saving, onSave, onHide}: {
    unassignedPersons: PersonDTO[];
    saving: boolean;
    onSave: (contract: NewContract) => void;
    onHide: () => void;
}) => {
    const formik = useFormik<ContractTermsValues & { personId: number | null }>({
        initialValues: {personId: null, roomId: null, startDate: null, endDate: null, amount: null, deposit: null, payDay: 10},
        validationSchema: Yup.object({...contractTermsSchema, personId: Yup.number().nullable().required("Wybierz najemcę")}),
        onSubmit: (values) => onSave({
            personId: values.personId!,
            roomId: values.roomId!,
            startDate: toIso(values.startDate),
            endDate: toIso(values.endDate),
            amount: values.amount!,
            deposit: values.deposit!,
            payedDate: values.payDay!,
        }),
    });

    const {startDate, endDate, roomId} = formik.values;
    const datesChosen = isNotNullable(startDate) && isNotNullable(endDate) && endDate >= startDate;
    const {data: freeRooms = [], isFetching: roomsLoading} = useUnassignedRooms(
        datesChosen ? {startDate: toIso(startDate), endDate: toIso(endDate)} : undefined
    );

    // a room picked for one period may be taken in another: drop it once the new list doesn't have it
    useEffect(() => {
        if (isNotNullable(roomId) && !roomsLoading && !freeRooms.some((room) => isEqual(roomId, room.id))) {
            formik.setFieldValue("roomId", null);
        }
    }, [freeRooms, roomsLoading, roomId]); // eslint-disable-line react-hooks/exhaustive-deps

    const roomHint = !datesChosen
        ? "Najpierw wybierz okres umowy – pokażemy pokoje wolne w tym czasie"
        : roomsLoading ? "Szukam wolnych pokoi…" : undefined;

    return (
        <FormDialog
            visible
            title="Nowa umowa"
            onHide={onHide}
            formId="contract-add-form"
            onSubmit={formik.handleSubmit}
            submitLabel="Dodaj umowę"
            saving={saving}
            size="md"
        >
            <SelectField
                formik={formik}
                name="personId"
                label="Najemca"
                placeholder="Wybierz osobę"
                emptyMessage="Wszyscy mają już umowę – dodaj osobę w zakładce Osoby"
                options={unassignedPersons.map((person) => ({label: `${person.firstName} ${person.lastName}`, value: person.id}))}
            />
            <div className="ku-form-row">
                <DateField formik={formik} name="startDate" label="Początek umowy"/>
                <DateField formik={formik} name="endDate" label="Koniec umowy"/>
            </div>
            <SelectField
                formik={formik}
                name="roomId"
                label="Pokój"
                placeholder={datesChosen ? "Wybierz wolny pokój" : "Najpierw wybierz okres"}
                hint={roomHint}
                emptyMessage="Żaden pokój nie jest wolny w tym okresie"
                disabled={!datesChosen}
                options={freeRooms.map((room) => ({label: roomLabel(room), value: room.id}))}
            />
            <div className="ku-form-row">
                <AmountField formik={formik} name="amount" label="Czynsz miesięczny"/>
                <AmountField formik={formik} name="deposit" label="Kaucja"/>
            </div>
            <IntegerField formik={formik} name="payDay" label="Dzień płatności" hint={PAY_DAY_HINT} min={1} max={31}/>
        </FormDialog>
    );
};

export const EditContractDialog = ({contract, saving, onSave, onHide}: {
    contract: ContractDTO;
    saving: boolean;
    onSave: (details: UpdateContractDetails) => void;
    onHide: () => void;
}) => {
    const {data: rooms = []} = useFetchRooms();
    const formik = useFormik<ContractTermsValues>({
        initialValues: {
            roomId: contract.room?.id ?? null,
            startDate: parseIsoDate(contract.startDate),
            endDate: parseIsoDate(contract.endDate),
            amount: contract.amount ?? null,
            deposit: contract.deposit ?? null,
            payDay: isNotNullable(contract.payedTillDayOfMonth) ? Number(contract.payedTillDayOfMonth) : null,
        },
        validationSchema: Yup.object(contractTermsSchema),
        onSubmit: (values) => onSave({
            contractId: contract.id,
            roomId: values.roomId,
            startDate: toIso(values.startDate),
            endDate: toIso(values.endDate),
            amount: values.amount,
            deposit: values.deposit,
            payedTillDayOfMonth: String(values.payDay),
        }),
    });

    return (
        <FormDialog
            visible
            title={`Edytuj umowę – ${tenantName(contract)}`}
            onHide={onHide}
            formId="contract-edit-form"
            onSubmit={formik.handleSubmit}
            submitLabel="Zapisz zmiany"
            saving={saving}
            size="md"
        >
            <SelectField
                formik={formik}
                name="roomId"
                label="Pokój"
                options={rooms.map((room) => ({label: roomLabel(room), value: room.id}))}
            />
            <div className="ku-form-row">
                <DateField formik={formik} name="startDate" label="Początek umowy"/>
                <DateField formik={formik} name="endDate" label="Koniec umowy"/>
            </div>
            <div className="ku-form-row">
                <AmountField formik={formik} name="amount" label="Czynsz miesięczny"/>
                <AmountField formik={formik} name="deposit" label="Kaucja"/>
            </div>
            <IntegerField formik={formik} name="payDay" label="Dzień płatności" hint={PAY_DAY_HINT} min={1} max={31}/>
        </FormDialog>
    );
};

export const TerminateContractDialog = ({contract, saving, onConfirm, onHide}: {
    contract: ContractDTO;
    saving: boolean;
    onConfirm: (details: DeleteContractDTO) => void;
    onHide: () => void;
}) => {
    const formik = useFormik({
        initialValues: {terminationDate: new Date() as Date | null, description: "", depositReturned: false, positiveCancel: false},
        validationSchema: Yup.object({terminationDate: requiredDate("Data zakończenia jest wymagana")}),
        onSubmit: (values) => onConfirm({
            contractId: contract.id,
            terminationDate: toIso(values.terminationDate),
            description: values.description.trim() || undefined,
            depositReturned: values.depositReturned,
            positiveCancel: values.positiveCancel,
        }),
    });

    return (
        <FormDialog
            visible
            title={`Zakończ umowę – ${tenantName(contract)}`}
            onHide={onHide}
            formId="contract-terminate-form"
            onSubmit={formik.handleSubmit}
            submitLabel="Zakończ umowę"
            submitVariant="danger"
            saving={saving}
        >
            <DetailList compact items={[
                {label: "Pokój", value: roomLabel(contract.room)},
                {label: "Okres", value: `${formatDatePl(contract.startDate)} – ${formatDatePl(contract.endDate)}`},
                {label: "Kaucja", value: money(contract.deposit)},
            ]}/>
            <p className="ku-form-note">Pokój zwolni się od dnia zakończenia. Tej operacji nie można cofnąć.</p>
            <DateField formik={formik} name="terminationDate" label="Data zakończenia"/>
            <CheckboxField formik={formik} name="depositReturned" label="Kaucja zwrócona"/>
            <CheckboxField formik={formik} name="positiveCancel" label="Zakończona polubownie"/>
            <TextAreaField formik={formik} name="description" label="Notatka (opcjonalnie)"/>
        </FormDialog>
    );
};

export const ContractDetailsDialog = ({contract, onHide}: { contract: ContractDTO; onHide: () => void }) => {
    const {label, tone} = contractStatus(contract);
    return (
        <InfoDialog visible title={tenantName(contract)} onHide={onHide}>
            <DetailList items={[
                {label: "Status", value: <Badge tone={tone}>{label}</Badge>},
                {label: "Pokój", value: roomLabel(contract.room)},
                {label: "Początek", value: formatDatePl(contract.startDate)},
                {label: "Koniec", value: formatDatePl(contract.endDate)},
                ...(contract.terminationDate ? [{label: "Zakończona", value: formatDatePl(contract.terminationDate)}] : []),
                {label: "Czynsz", value: money(contract.amount)},
                {label: "Dzień płatności", value: contract.payedTillDayOfMonth ? `${contract.payedTillDayOfMonth}. dnia miesiąca` : "—"},
                {label: "Kaucja", value: contract.depositReturned ? `${money(contract.deposit)} · zwrócona` : money(contract.deposit)},
                ...(contract.description ? [{label: "Notatka", value: contract.description}] : []),
            ]}/>
        </InfoDialog>
    );
};

const CHANGE_TYPE: Record<string, { label: string; icon: string; color: string }> = {
    CREATED: {label: "Umowa zawarta", icon: "pi pi-plus", color: "var(--ku-success)"},
    UPDATED: {label: "Zmiana warunków", icon: "pi pi-pencil", color: "var(--ku-accent)"},
    TERMINATED: {label: "Umowa zakończona", icon: "pi pi-check", color: "var(--ku-ended)"},
};
const CONTRACT_STATUS_LABEL: Record<string, string> = {ACTIVE: "Aktywna", TERMINATED: "Zakończona"};

const formatDateTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pl-PL", {dateStyle: "medium", timeStyle: "short"});
};

const diffEntries = (curr: ContractHistoryDTO, prev: ContractHistoryDTO | undefined, roomName: (id: number) => string) => {
    if (!prev) return [];
    const fields: [string, string, string][] = [
        ["Czynsz", formatCurrency(prev.amount), formatCurrency(curr.amount)],
        ["Kaucja", formatCurrency(prev.deposit), formatCurrency(curr.deposit)],
        ["Początek", formatDatePl(prev.startDate), formatDatePl(curr.startDate)],
        ["Koniec", formatDatePl(prev.endDate), formatDatePl(curr.endDate)],
        ["Dzień płatności", prev.payedTillDayOfMonth, curr.payedTillDayOfMonth],
        ["Pokój", roomName(prev.roomId), roomName(curr.roomId)],
        ["Status", CONTRACT_STATUS_LABEL[prev.status] ?? prev.status, CONTRACT_STATUS_LABEL[curr.status] ?? curr.status],
        ["Data zakończenia", formatDatePl(prev.terminationDate), formatDatePl(curr.terminationDate)],
        ["Notatka", prev.description || "—", curr.description || "—"],
    ];
    return fields.filter(([, from, to]) => from !== to).map(([label, from, to]) => ({label, from, to}));
};

export const ContractHistoryDialog = ({contract, onHide}: { contract: ContractDTO; onHide: () => void }) => {
    const {data: history = [], isLoading} = useContractHistoryQuery(contract.id);
    const {data: rooms = []} = useFetchRooms();
    const roomName = (id: number) => roomLabel(rooms.find((room) => isEqual(id, room.id)));
    // newest first; each entry diffs against the next (chronologically earlier) one
    const events = [...history].reverse();

    return (
        <InfoDialog visible title={`Historia umowy – ${tenantName(contract)}`} onHide={onHide} size="md">
            {isLoading ? <PageLoading label="Wczytywanie historii umowy"/> : 0 === events.length ? (
                <p className="ku-form-note">Brak zapisanych zmian tej umowy.</p>
            ) : (
                <Timeline
                    value={events}
                    className="ku-history"
                    marker={(entry: ContractHistoryDTO) => {
                        const type = CHANGE_TYPE[entry.changeType];
                        return (
                            <span className="ku-history-marker" style={{background: type?.color ?? "var(--ku-neutral)"}} aria-hidden="true">
                                <i className={type?.icon ?? "pi pi-circle"}/>
                            </span>
                        );
                    }}
                    content={(entry: ContractHistoryDTO, index: number) => {
                        const diffs = diffEntries(entry, events[index + 1], roomName);
                        return (
                            <div className="ku-history-entry">
                                <div className="ku-history-title">{CHANGE_TYPE[entry.changeType]?.label ?? entry.changeType}</div>
                                <div className="ku-history-time">{formatDateTime(entry.changedAt)}</div>
                                {diffs.length > 0 ? (
                                    <ul className="ku-history-diffs">
                                        {diffs.map((diff) => (
                                            <li key={diff.label}>
                                                {diff.label}: <s>{diff.from}</s> → <strong>{diff.to}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="ku-history-time">
                                        {roomName(entry.roomId)} · czynsz {formatCurrency(entry.amount)} · kaucja {formatCurrency(entry.deposit)}
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />
            )}
        </InfoDialog>
    );
};
