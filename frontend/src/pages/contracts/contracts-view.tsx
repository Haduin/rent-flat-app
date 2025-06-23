import {ProgressSpinner} from "primereact/progressspinner";
import {DataTable} from "primereact/datatable";
import {useContractsView} from "./contracts-view.hook.tsx";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {ContractDto, ContractStatus} from "../../components/commons/types.ts";
import AddContractView from "./add-contract-view.tsx";
import ContractDetailsModal from "./contract-details-modal.tsx";
import DeleteContractModal from "./delete-contract-modal.tsx";
import {Checkbox} from "primereact/checkbox";

const ContractsView = () => {

    const {
        loading,
        isAddContractDialogVisible,
        closeAddDialog,
        openAddDialog,
        unassignedPersons,
        addContractMutation,

        isEditContactModalOpen,
        handleOpenEditDialog,
        handleCloseEditDialog,
        selectedContract,
        handleOpenDeleteDialog,
        deleteContractMutation,
        isDeleteDialogVisible,
        handleCloseDeleteDialog,
        showOnlyActiveContracts, setShowOnlyActiveContracts,
        showContracts
    } = useContractsView();


    const renderHeader = () => {
        return (
            <div className="flex flex-wrap justify-content-between align-items-center">
                <div className="flex align-items-center gap-2">
                    <Button
                        label="Dodaj"
                        severity="secondary"
                        onClick={openAddDialog}
                        rounded
                        icon="pi pi-plus"
                    />
                    <div className="flex align-items-center ml-2">
                        <Checkbox
                            checked={showOnlyActiveContracts}
                            onChange={() => setShowOnlyActiveContracts(!showOnlyActiveContracts)}
                            className="mr-1 p-checkbox-smaller"
                        />
                        <label className="ml-1 font-medium text-sm">Pokaż tylko aktualnych</label>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1>Kontrakty</h1>
            {loading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div>
                    <DataTable value={showContracts()} paginator rows={10} stripedRows header={renderHeader()}>
                        <Column field="id" header="ID"/>
                        <Column field="personId" header="Osoba"
                                body={(rowData: ContractDto) => `${rowData.person?.firstName}  ${rowData.person?.lastName}`}/>
                        <Column field="roomId" header="Mieszkanie | Pokój"
                                body={(rowData: ContractDto) => `${rowData.room?.apartment}  ${rowData.room?.number}`}
                        />
                        <Column field="startDate" header="Od kiedy"/>
                        <Column field="endDate"
                                header="Do kiedy"
                                body={(rowData: ContractDto) => (
                                    <div>
                                        {rowData.terminationDate ? (
                                            <div className="flex gap-2 items-center">
                                                <span className="line-through">{rowData.endDate}</span>
                                                <span className="text-red-500">{rowData.terminationDate}</span>
                                            </div>
                                        ) : (
                                            rowData.endDate
                                        )}
                                    </div>
                                )}
                        />

                        <Column field="amount" header="Cena"/>
                        <Column header="Akcje"
                                body={(rowData: ContractDto) => (
                                    <div className="flex gap-2">
                                        <Button label="Szczegóły"
                                                icon="pi pi-eye"
                                                onClick={() => handleOpenEditDialog(rowData)}
                                                className="p-button-rounded p-button-sm"/>
                                        <Button label="Zakończ"
                                                severity="warning"
                                                disabled={rowData.status === ContractStatus.TERMINATED}
                                                onClick={() => handleOpenDeleteDialog(rowData)}
                                                icon="pi pi-trash"
                                                className="p-button-rounded p-button-sm"/>
                                    </div>
                                )}
                        />
                    </DataTable>
                    <DeleteContractModal
                        selectedContract={selectedContract}
                        isVisible={isDeleteDialogVisible}
                        onHide={handleCloseDeleteDialog}
                        onConfirm={deleteContractMutation}
                    />
                    <AddContractView isVisible={isAddContractDialogVisible}
                                     onSave={addContractMutation.mutate}
                                     unassignedPersons={unassignedPersons}
                                     onHide={closeAddDialog}/>
                    <ContractDetailsModal
                        visible={isEditContactModalOpen}
                        onHide={handleCloseEditDialog}
                        selectedContract={selectedContract}
                    />
                </div>
            )}
        </div>
    );
};

export default ContractsView;
