import {ProgressSpinner} from "primereact/progressspinner";
import {DataTable} from "primereact/datatable";
import {useContractsView} from "./contracts-view.hook.tsx";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {Contract} from "../../components/commons/types.ts";
import AddContractView from "./add-contract-view.tsx";
import ContractDetailsModal from "./contract-details-modal.tsx";

const ContractsView = () => {

    const {
        contracts,
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

        // isDeleteDialogVisible,
        // handleOpenDeleteDialog,
        // handleCloseDeleteDialog,
        // deleteContractMutation,
    } = useContractsView();

    return (
        <div>
            <h1>Kontrakty</h1>
            {loading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div>
                    <Button label="Dodaj"
                            icon="pi pi-plus"
                            className="p-button-rounded p-button-success"
                            onClick={openAddDialog}
                    />
                    <DataTable value={contracts} paginator rows={10} stripedRows>
                        <Column field="id" header="ID"></Column>
                        <Column field="personId" header="Osoba"
                                body={(rowData: Contract) => `${rowData.person?.firstName}  ${rowData.person?.lastName}`}/>
                        <Column field="roomId" header="Mieszkanie | Pokój"
                                body={(rowData: Contract) => `${rowData.room?.apartment}  ${rowData.room?.number}`}
                        />
                        <Column field="startDate" header="Od kiedy"></Column>
                        <Column field="endDate" header="Do kiedy"></Column>
                        <Column field="amount" header="Cena"></Column>
                        <Column header="Akcje"
                                body={(rowData: Contract) => (
                                    <div className="flex gap-2">
                                        <Button label="Szczegóły"
                                                icon="pi pi-eye"
                                                onClick={() => handleOpenEditDialog(rowData)}
                                                className="p-button-rounded p-button-sm"/>
                                        {/*<Button label="Usuń"*/}
                                        {/*        severity="danger"*/}
                                        {/*        icon="pi pi-trash"*/}
                                        {/*        onClick={() => handleOpenDeleteDialog(rowData)}*/}
                                        {/*        className="p-button-rounded p-button-sm"/>*/}
                                    </div>
                                )}
                        >
                        </Column>
                    </DataTable>
                    <AddContractView isVisible={isAddContractDialogVisible}
                                     onSave={addContractMutation.mutate}
                                     unassignedPersons={unassignedPersons}
                                     onHide={closeAddDialog}/>
                    <ContractDetailsModal
                        visible={isEditContactModalOpen}
                        onHide={handleCloseEditDialog}
                        selectedContract={selectedContract}
                    />
                    {/*<DeleteContractDialog*/}
                    {/*    isVisible={isDeleteDialogVisible}*/}
                    {/*    onHide={handleCloseDeleteDialog}*/}
                    {/*    onConfirm={deleteContractMutation.mutate}*/}
                    {/*    selectedContract={selectedContract}*/}
                    {/*/>*/}
                    {/*<ContractDetailsDialog isVisible={isDetailsDialogVisible}*/}
                    {/*                       onHide={closeDetailsDialog}*/}
                    {/*                       selectedContract={selectedContract}/>*/}
                </div>
            )}
        </div>
    );
};

export default ContractsView;
