import {ProgressSpinner} from "primereact/progressspinner";
import {DataTable} from "primereact/datatable";
import {useContractsView} from "./ContractsView.hook.tsx";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {Contract} from "./types.ts";
import ContractDetailsDialog from "./ContractDetailsDialog.tsx";
import AddContractView from "./AddContractView.tsx";

const ContractsView = () => {

    const {
        contracts,
        loading,
        openDetailsDialog,
        closeDetailsDialog,
        isDetailsDialogVisible,
        selectedContract,
        isAddContractDialogVisible,
        closeAddDialog,
        openAddDialog,
    } = useContractsView();

    return (
        <div>
            <h1>Contracts</h1>
            {loading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div>
                    <Button label="Dodaj" icon="pi pi-plus" className="p-button-rounded p-button-success"
                            onClick={openAddDialog}
                    />
                    <DataTable value={contracts} paginator rows={10} stripedRows>
                        <Column field="id" header="ID"></Column>
                        <Column field="personId" header="Osoba"></Column>
                        <Column field="roomId" header="Pokój"></Column>
                        <Column field="startDate" header="Od kiedy"></Column>
                        <Column field="endDate" header="Do kiedy"></Column>
                        <Column field="amount" header="Cena"></Column>
                        <Column header="Akcje"
                                body={(rowData: Contract) => (
                                    <div>
                                        <Button label="Pokaż"
                                                icon="pi pi-pencil"
                                                onClick={() => openDetailsDialog(rowData)}
                                                className="p-button-rounded p-button-sm"/>
                                    </div>
                                )}
                        >
                        </Column>
                    </DataTable>
                    <AddContractView isVisible={isAddContractDialogVisible}
                                     onHide={closeAddDialog}/>
                    <ContractDetailsDialog isVisible={isDetailsDialogVisible}
                                           onHide={closeDetailsDialog}
                                           selectedContract={selectedContract}/>
                </div>
            )}
        </div>
    );
};

export default ContractsView;
