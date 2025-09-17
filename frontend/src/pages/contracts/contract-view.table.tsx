import React from 'react';
import {Column} from "primereact/column";
import {ContractDto, ContractStatus} from "../../components/commons/types.ts";
import {Button} from "primereact/button";
import {DataTable} from "primereact/datatable";

interface ContractTableProps {
    renderHeader: () => React.ReactElement;
    showContracts: () => ContractDto[];
    handleOpenEditDialog: (contract: ContractDto) => void;
    handleOpenDeleteDialog: (contract: ContractDto) => void;
    handleOpenDetailsDialog: (contract: ContractDto) => void;
}

export const ContractTable = ({
                                  renderHeader,
                                  showContracts,
                                  handleOpenEditDialog,
                                  handleOpenDeleteDialog,
                                  handleOpenDetailsDialog
                              }: ContractTableProps) => {
    return (
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
                                    onClick={() => handleOpenDetailsDialog(rowData)}
                                    className="p-button-rounded p-button-sm"/>
                            <Button label="Edytuj"
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
    );
};
