import {ProgressSpinner} from "primereact/progressspinner";
import {useContractsView} from "./contracts-view.hook.tsx";
import {Button} from "primereact/button";
import AddContractView from "./add-contract-view.tsx";
import ContractDetailsModal from "./contract-details-modal.tsx";
import DeleteContractModal from "./delete-contract-modal.tsx";
import {Checkbox} from "primereact/checkbox";
import {ContractTable} from "./contract-view.table.tsx";

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
                    <ContractTable
                        renderHeader={renderHeader}
                        showContracts={showContracts}
                        handleOpenEditDialog={handleOpenEditDialog}
                        handleOpenDeleteDialog={handleOpenDeleteDialog}
                    />

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
