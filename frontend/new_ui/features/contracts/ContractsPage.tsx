import {useMemo, useState} from "react";
import {ContractStatusFilter, useContractsView} from "../../../src/pages/contracts/contract-view/contracts-view.hook.tsx";
import {AddContractDialog, ContractDetailsDialog, ContractHistoryDialog, EditContractDialog, TerminateContractDialog} from "./ContractDialogs.tsx";
import {contractStatus} from "./contract-status.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {Page} from "../../components/layout/Page.tsx";
import {Text} from "../../components/ui/Text.tsx";
import {FilterBar} from "../../components/ui/FilterBar.tsx";
import {SearchInput} from "../../components/ui/SearchInput.tsx";
import {SegmentedControl, SegmentOption} from "../../components/ui/SegmentedControl.tsx";
import {DataTableCard, DataTableColumn} from "../../components/ui/DataTableCard.tsx";
import {Button} from "../../components/ui/Button.tsx";
import {Badge} from "../../components/ui/Badge.tsx";
import {formatDatePl} from "../../utils/date.ts";
import {IconPlus} from "../../components/ui/icons.tsx";
import type {ContractDTO} from "../../../src/api/generated";
import {isNotEqual} from "../../../src/utils/typeguards";

const STATUS_FILTER_OPTIONS: SegmentOption<ContractStatusFilter>[] = [
    {label: "Aktywne", value: "ACTIVE"},
    {label: "Zakończone", value: "TERMINATED"},
    {label: "Wszystkie", value: "ALL"},
];

const ContractsPage = () => {
    const {
        loading,
        selectedContract,
        unassignedPersons,

        handleOpenDetailsDialog,
        handleCloseDetailsDialog,
        isDetailsDialogVisible,

        isAddContractDialogVisible,
        closeAddDialog,
        openAddDialog,
        addContractMutation,

        isEditContractVisible,
        handleOpenEditDialog,
        handleCloseEditDialog,
        editContractMutation,

        isDeleteDialogVisible,
        handleOpenDeleteDialog,
        handleCloseDeleteDialog,
        deleteContractMutation,

        isHistoryDialogVisible,
        handleOpenHistoryDialog,
        handleCloseHistoryDialog,

        contractStatusFilter,
        setContractStatusFilter,
        showContracts,
    } = useContractsView();

    const [search, setSearch] = useState("");

    const contracts = useMemo(() => {
        // most urgent first (past end date, ending soon), then by end date
        const list = [...(showContracts() ?? [])].sort((a, b) =>
            contractStatus(a).urgency - contractStatus(b).urgency || (a.endDate ?? "").localeCompare(b.endDate ?? "")
        );
        const needle = search.trim().toLowerCase();
        if (!needle) return list;
        return list.filter((contract: ContractDTO) =>
            [contract.person?.firstName, contract.person?.lastName, contract.room?.apartment, contract.room?.number]
                .join(" ")
                .toLowerCase()
                .includes(needle)
        );
    }, [showContracts, search]);

    const tenantBody = (contract: ContractDTO) => (
        <Text weight="semibold">
            {contract.person?.firstName} {contract.person?.lastName}
        </Text>
    );

    const roomBody = (contract: ContractDTO) => `${contract.room?.apartment ?? ""} · ${contract.room?.number ?? ""}`;

    const periodBody = (contract: ContractDTO) => (
        <span>
            {formatDatePl(contract.startDate)} – {contract.terminationDate ? (
                <>
                    <Text tone="muted" strike>{formatDatePl(contract.endDate)}</Text>{" "}
                    zakończona {formatDatePl(contract.terminationDate)}
                </>
            ) : (
                formatDatePl(contract.endDate)
            )}
        </span>
    );

    const amountBody = (contract: ContractDTO) => (contract.amount != null ? formatCurrency(contract.amount) : "—");
    const depositBody = (contract: ContractDTO) => (contract.deposit != null ? formatCurrency(contract.deposit) : "—");

    const statusBody = (contract: ContractDTO) => {
        const {label, tone} = contractStatus(contract);
        return <Badge tone={tone}>{label}</Badge>;
    };

    const rowActions = (contract: ContractDTO) => (
        <>
            <Button
                variant="secondary"
                size="small"
                icon="pi pi-eye"
                tooltip="Szczegóły"
                aria-label="Szczegóły"
                tooltipOptions={{position: "top"}}
                onClick={() => handleOpenDetailsDialog(contract)}
            />
            <Button
                variant="secondary"
                size="small"
                icon="pi pi-pencil"
                tooltip="Edytuj"
                aria-label="Edytuj"
                tooltipOptions={{position: "top"}}
                disabled={isNotEqual("ACTIVE", contract.status)}
                onClick={() => handleOpenEditDialog(contract)}
            />
            <Button
                variant="secondary"
                size="small"
                icon="pi pi-history"
                tooltip="Historia"
                aria-label="Historia"
                tooltipOptions={{position: "top"}}
                onClick={() => handleOpenHistoryDialog(contract)}
            />
            <Button
                variant="danger-outline"
                size="small"
                icon="pi pi-times"
                tooltip="Zakończ kontrakt"
                aria-label="Zakończ kontrakt"
                tooltipOptions={{position: "top"}}
                disabled={isNotEqual("ACTIVE", contract.status)}
                onClick={() => handleOpenDeleteDialog(contract)}
            />
        </>
    );

    const columns: DataTableColumn<ContractDTO>[] = [
        {header: "Najemca", body: tenantBody, sortable: true, field: "person.lastName"},
        {header: "Mieszkanie / pokój", body: roomBody},
        {header: "Okres", body: periodBody, sortable: true, field: "endDate"},
        {header: "Czynsz", body: amountBody, sortable: true, field: "amount"},
        {header: "Kaucja", body: depositBody, optional: true},
        {header: "Status", body: statusBody, sortable: true, field: "status"},
    ];

    return (
        <Page
            title="Kontrakty"
            actions={
                <Button variant="primary" icon={<IconPlus size={15}/>} onClick={openAddDialog}>
                    Nowa umowa
                </Button>
            }
        >
            <FilterBar>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Szukaj najemcy lub pokoju…"
                    ariaLabel="Szukaj najemcy lub pokoju"
                />
                <SegmentedControl value={contractStatusFilter} onChange={setContractStatusFilter} options={STATUS_FILTER_OPTIONS}/>
            </FilterBar>

            <DataTableCard
                value={contracts}
                columns={columns}
                rowActions={rowActions}
                loading={loading}
                emptyMessage={search.trim() ? "Żadna umowa nie pasuje do wyszukiwania" : "Brak umów w tym widoku"}
            />

            {isAddContractDialogVisible && (
                <AddContractDialog
                    unassignedPersons={unassignedPersons}
                    saving={addContractMutation.isPending}
                    onSave={addContractMutation.mutate}
                    onHide={closeAddDialog}
                />
            )}
            {selectedContract && isEditContractVisible && (
                <EditContractDialog
                    contract={selectedContract}
                    saving={editContractMutation.isPending}
                    onSave={editContractMutation.mutate}
                    onHide={handleCloseEditDialog}
                />
            )}
            {selectedContract && isDeleteDialogVisible && (
                <TerminateContractDialog
                    contract={selectedContract}
                    saving={deleteContractMutation.isPending}
                    onConfirm={deleteContractMutation.mutate}
                    onHide={handleCloseDeleteDialog}
                />
            )}
            {selectedContract && isDetailsDialogVisible && (
                <ContractDetailsDialog contract={selectedContract} onHide={handleCloseDetailsDialog}/>
            )}
            {selectedContract && isHistoryDialogVisible && (
                <ContractHistoryDialog contract={selectedContract} onHide={handleCloseHistoryDialog}/>
            )}
        </Page>
    );
};

export default ContractsPage;
