import {Dialog} from "primereact/dialog";
import {Timeline} from "primereact/timeline";
import {ProgressSpinner} from "primereact/progressspinner";
import {useContractHistoryQuery} from "../api/contracts.api.ts";
import {formatCurrency} from "../../../components/commons/currencyFormatter.ts";
import {ContractHistoryDTO} from "../../../api/generated";
import {ContractHistoryDialogProps} from "./contract-history-dialog.props.ts";

const CHANGE_TYPE_LABEL: Record<string, string> = {
    CREATED: "Utworzono kontrakt",
    UPDATED: "Aktualizacja kontraktu",
    TERMINATED: "Zakończono kontrakt",
};

const CHANGE_TYPE_ICON: Record<string, string> = {
    CREATED: "pi pi-plus",
    UPDATED: "pi pi-pencil",
    TERMINATED: "pi pi-times",
};

const CHANGE_TYPE_COLOR: Record<string, string> = {
    CREATED: "#22c55e",
    UPDATED: "#3b82f6",
    TERMINATED: "#ef4444",
};

const formatDateTime = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('pl-PL', {dateStyle: 'medium', timeStyle: 'short'});
};

interface FieldDiff {
    label: string;
    from: string;
    to: string;
}

const diffEntries = (curr: ContractHistoryDTO, prev?: ContractHistoryDTO): FieldDiff[] => {
    if (!prev) return [];
    const diffs: FieldDiff[] = [];
    if (curr.amount !== prev.amount) {
        diffs.push({label: "Czynsz", from: formatCurrency(prev.amount), to: formatCurrency(curr.amount)});
    }
    if (curr.deposit !== prev.deposit) {
        diffs.push({label: "Kaucja", from: formatCurrency(prev.deposit), to: formatCurrency(curr.deposit)});
    }
    if (curr.startDate !== prev.startDate) {
        diffs.push({label: "Data rozpoczęcia", from: prev.startDate, to: curr.startDate});
    }
    if (curr.endDate !== prev.endDate) {
        diffs.push({label: "Data zakończenia", from: prev.endDate, to: curr.endDate});
    }
    if (curr.payedTillDayOfMonth !== prev.payedTillDayOfMonth) {
        diffs.push({label: "Czynsz płatny do dnia", from: prev.payedTillDayOfMonth, to: curr.payedTillDayOfMonth});
    }
    if (curr.roomId !== prev.roomId) {
        diffs.push({label: "Pokój (ID)", from: String(prev.roomId), to: String(curr.roomId)});
    }
    if (curr.status !== prev.status) {
        diffs.push({label: "Status", from: prev.status, to: curr.status});
    }
    if (curr.terminationDate !== prev.terminationDate) {
        diffs.push({label: "Data zakończenia umowy", from: prev.terminationDate ?? "-", to: curr.terminationDate ?? "-"});
    }
    if ((curr.description ?? "") !== (prev.description ?? "")) {
        diffs.push({label: "Opis", from: prev.description || "-", to: curr.description || "-"});
    }
    return diffs;
};

const ContractHistoryDialog = ({visible, onHide, selectedContract}: ContractHistoryDialogProps) => {
    const {data: history = [], isLoading} = useContractHistoryQuery(selectedContract?.id ?? null);

    // Newest first for display; diffing still walks chronologically (against the next, earlier index).
    const events = [...history].reverse();

    return (
        <Dialog
            header={`Historia kontraktu${selectedContract ? ` #${selectedContract.id}` : ''}`}
            visible={visible}
            style={{width: '45rem'}}
            onHide={onHide}
        >
            {isLoading ? (
                <div className="flex justify-content-center p-4">
                    <ProgressSpinner/>
                </div>
            ) : events.length === 0 ? (
                <p className="text-sm text-gray-500">Brak zapisanej historii dla tego kontraktu.</p>
            ) : (
                <Timeline
                    value={events}
                    align="left"
                    opposite={(entry: ContractHistoryDTO) => (
                        <span className="text-xs text-gray-500">{formatDateTime(entry.changedAt)}</span>
                    )}
                    marker={(entry: ContractHistoryDTO) => (
                        <span
                            className="flex align-items-center justify-content-center border-circle text-white"
                            style={{width: '2rem', height: '2rem', background: CHANGE_TYPE_COLOR[entry.changeType] ?? '#6b7280'}}
                        >
                            <i className={CHANGE_TYPE_ICON[entry.changeType] ?? 'pi pi-circle'} style={{fontSize: '0.85rem'}}/>
                        </span>
                    )}
                    content={(entry: ContractHistoryDTO, index: number) => {
                        const prev = events[index + 1]; // chronologically earlier entry
                        const diffs = diffEntries(entry, prev);
                        return (
                            <div className="pb-3">
                                <div className="font-medium">{CHANGE_TYPE_LABEL[entry.changeType] ?? entry.changeType}</div>
                                {diffs.length > 0 ? (
                                    <ul className="m-0 mt-2 pl-3 text-sm">
                                        {diffs.map((diff) => (
                                            <li key={diff.label}>
                                                {diff.label}: <span className="line-through text-gray-500">{diff.from}</span>
                                                {' → '}
                                                <span className="font-medium">{diff.to}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-sm text-gray-500 mt-1">
                                        Czynsz: {formatCurrency(entry.amount)}, Kaucja: {formatCurrency(entry.deposit)}
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />
            )}
        </Dialog>
    );
};

export default ContractHistoryDialog;
