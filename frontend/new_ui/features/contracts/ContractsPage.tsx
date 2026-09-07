import {useMemo, useState} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {InputText} from "primereact/inputtext";
import {IconField} from "primereact/iconfield";
import {InputIcon} from "primereact/inputicon";
import {Checkbox} from "primereact/checkbox";
import {useContractsView} from "../../../src/pages/contracts/contract-view/contracts-view.hook.tsx";
import AddContractView from "../../../src/pages/contracts/add-contract-view/add-contract-view.tsx";
import {DeleteContractModal} from "../../../src/pages/contracts/delete-contract-modal/delete-contract-modal.tsx";
import {UpdateContractModal} from "../../../src/pages/contracts/update-contract-modal/update-contract-modal.tsx";
import ContractDetailsModal from "../../../src/pages/contracts/contract-details/contract-details-modal.tsx";
import ContractHistoryDialog from "../../../src/pages/contracts/contract-history/contract-history-dialog.tsx";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {PageHeader} from "../../components/ui/PageHeader.tsx";
import {Card} from "../../components/ui/Card.tsx";
import {Button} from "../../components/ui/Button.tsx";
import {Badge} from "../../components/ui/Badge.tsx";
import {IconPlus} from "../../components/ui/icons.tsx";
import type {ContractDTO} from "../../../src/api/generated";

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

        showOnlyActiveContracts,
        setShowOnlyActiveContracts,
        showContracts,
    } = useContractsView();

    const [search, setSearch] = useState("");

    const contracts = useMemo(() => {
        const list = showContracts() ?? [];
        if (!search.trim()) return list;
        const needle = search.trim().toLowerCase();
        return list.filter((contract: ContractDTO) =>
            `${contract.person?.firstName ?? ""} ${contract.person?.lastName ?? ""}`.toLowerCase().includes(needle)
        );
    }, [showContracts, search]);

    const tenantBody = (contract: ContractDTO) => (
        <span style={{fontWeight: 600}}>
            {contract.person?.firstName} {contract.person?.lastName}
        </span>
    );

    const roomBody = (contract: ContractDTO) => `${contract.room?.apartment ?? ""} · ${contract.room?.number ?? ""}`;

    const periodBody = (contract: ContractDTO) => (
        <div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap"}}>
            <span>
                {contract.startDate} – {contract.terminationDate ? (
                    <>
                        <span style={{textDecoration: "line-through"}}>{contract.endDate}</span>{" "}
                        <span style={{color: "var(--ku-danger)"}}>{contract.terminationDate}</span>
                    </>
                ) : (
                    contract.endDate
                )}
            </span>
            {contract.alreadyExpired && <Badge tone="danger">Już się skończył</Badge>}
            {contract.expiringSoon && <Badge tone="warning">Kończy się wkrótce</Badge>}
        </div>
    );

    const amountBody = (contract: ContractDTO) => (contract.amount != null ? formatCurrency(contract.amount) : "—");
    const depositBody = (contract: ContractDTO) => (contract.deposit != null ? formatCurrency(contract.deposit) : "—");

    const statusBody = (contract: ContractDTO) => (
        <Badge tone={contract.status === "ACTIVE" ? "success" : "ended"}>
            {contract.status === "ACTIVE" ? "Aktywna" : "Zakończona"}
        </Badge>
    );

    const actionsBody = (contract: ContractDTO) => (
        <div style={{display: "flex", gap: 6, justifyContent: "flex-end"}}>
            <Button
                variant="secondary"
                size="small"
                icon="pi pi-eye"
                tooltip="Szczegóły"
                tooltipOptions={{position: "top"}}
                onClick={() => handleOpenDetailsDialog(contract)}
            />
            <Button
                variant="secondary"
                size="small"
                icon="pi pi-pencil"
                tooltip="Edytuj"
                tooltipOptions={{position: "top"}}
                disabled={contract.status !== "ACTIVE"}
                onClick={() => handleOpenEditDialog(contract)}
            />
            <Button
                variant="secondary"
                size="small"
                icon="pi pi-history"
                tooltip="Historia"
                tooltipOptions={{position: "top"}}
                onClick={() => handleOpenHistoryDialog(contract)}
            />
            <Button
                variant="danger-outline"
                size="small"
                icon="pi pi-times"
                tooltip="Zakończ kontrakt"
                tooltipOptions={{position: "top"}}
                disabled={contract.status !== "ACTIVE"}
                onClick={() => handleOpenDeleteDialog(contract)}
            />
        </div>
    );

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 20}}>
            <PageHeader
                title="Kontrakty"
                actions={
                    <Button variant="primary" icon={<IconPlus size={15}/>} onClick={openAddDialog}>
                        Nowa umowa
                    </Button>
                }
            />

            <Card padding={20} style={{display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12}}>
                <IconField iconPosition="left" className="ku-search-input">
                    <InputIcon className="pi pi-search"/>
                    <InputText
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Szukaj najemcy..."
                        style={{width: "100%"}}
                    />
                </IconField>
                <label style={{display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, cursor: "pointer"}}>
                    <Checkbox checked={showOnlyActiveContracts} onChange={() => setShowOnlyActiveContracts(!showOnlyActiveContracts)}/>
                    Tylko aktywne
                </label>
            </Card>

            <Card padding={0} style={{overflow: "hidden"}}>
                <DataTable
                    value={contracts}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    stripedRows
                    responsiveLayout="stack"
                    breakpoint="860px"
                    emptyMessage="Brak kontraktów do wyświetlenia"
                >
                    <Column header="Najemca" body={tenantBody} sortable field="person.lastName"/>
                    <Column header="Mieszkanie / pokój" body={roomBody}/>
                    <Column header="Okres" body={periodBody}/>
                    <Column header="Czynsz" body={amountBody} sortable field="amount"/>
                    <Column header="Kaucja" body={depositBody}/>
                    <Column header="Status" body={statusBody} sortable field="status"/>
                    <Column header="" body={actionsBody} style={{width: 140}}/>
                </DataTable>
            </Card>

            {isDeleteDialogVisible && (
                <DeleteContractModal
                    selectedContract={selectedContract}
                    isVisible={isDeleteDialogVisible}
                    onHide={handleCloseDeleteDialog}
                    onConfirm={deleteContractMutation}
                />
            )}
            {isAddContractDialogVisible && (
                <AddContractView
                    isVisible={isAddContractDialogVisible}
                    onSave={addContractMutation.mutate}
                    unassignedPersons={unassignedPersons}
                    onHide={closeAddDialog}
                />
            )}
            {isDetailsDialogVisible && (
                <ContractDetailsModal
                    selectedContract={selectedContract}
                    visible={isDetailsDialogVisible}
                    onHide={handleCloseDetailsDialog}
                />
            )}
            {isEditContractVisible && (
                <UpdateContractModal
                    selectedContract={selectedContract}
                    isVisible={isEditContractVisible}
                    onHide={handleCloseEditDialog}
                    onSave={editContractMutation}
                />
            )}
            {isHistoryDialogVisible && (
                <ContractHistoryDialog
                    selectedContract={selectedContract}
                    visible={isHistoryDialogVisible}
                    onHide={handleCloseHistoryDialog}
                />
            )}
        </div>
    );
};

export default ContractsPage;
