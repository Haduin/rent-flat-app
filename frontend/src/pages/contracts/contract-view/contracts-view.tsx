import {ProgressSpinner} from "primereact/progressspinner";
import {useContractsView} from "./contracts-view.hook.tsx";
import {Button} from "primereact/button";
import AddContractView from "../add-contract-view/add-contract-view.tsx";
import {DeleteContractModal} from "../delete-contract-modal/delete-contract-modal.tsx";
import {Checkbox} from "primereact/checkbox";
import {ContractTable} from "../contract-view-table/contract-view.table.tsx";
import {UpdateContractModal} from "../update-contract-modal/update-contract-modal.tsx";
import ContractDetailsModal from "../contract-details/contract-details-modal.tsx";
import ContractHistoryDialog from "../contract-history/contract-history-dialog.tsx";

const ContractsView = () => {

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
        <div className="text-black p-2 flex flex-col gap-2">
            <h1>Kontrakty</h1>
            {loading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div>
                    <ContractTable
                        renderHeader={renderHeader}
                        showContracts={showContracts}
                        handleOpenEditDialog={handleOpenEditDialog}
                        handleOpenDetailsDialog={handleOpenDetailsDialog}
                        handleOpenDeleteDialog={handleOpenDeleteDialog}
                        handleOpenHistoryDialog={handleOpenHistoryDialog}
                    />

                    {isDeleteDialogVisible && (
                        <DeleteContractModal
                            selectedContract={selectedContract}
                            isVisible={isDeleteDialogVisible}
                            onHide={handleCloseDeleteDialog}
                            onConfirm={deleteContractMutation}
                        />
                    )}
                    {isAddContractDialogVisible && (
                        <AddContractView isVisible={isAddContractDialogVisible}
                                         onSave={addContractMutation.mutate}
                                         unassignedPersons={unassignedPersons}
                                         onHide={closeAddDialog}/>
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
            )}
        </div>
    );
};

export default ContractsView;
