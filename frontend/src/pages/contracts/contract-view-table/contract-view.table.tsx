import {Column} from "primereact/column";
import {ContractStatus} from "../../../components/commons/types.ts";
import {Button} from "primereact/button";
import {Tag} from "primereact/tag";
import {DataTable} from "primereact/datatable";
import {ContractDTO} from "../../../api/generated";
import {ContractTableProps} from "./contract-view-table.props.ts";


export const ContractTable = ({
                                  renderHeader,
                                  showContracts,
                                  handleOpenEditDialog,
                                  handleOpenDeleteDialog,
                                  handleOpenDetailsDialog,
                                  handleOpenHistoryDialog
                              }: ContractTableProps) => {
    return (
        <DataTable value={showContracts()} paginator rows={10} stripedRows header={renderHeader()}>
            <Column field="id" header="ID"/>
            <Column field="personId" header="Osoba"
                    body={(rowData: ContractDTO) => `${rowData.person?.firstName}  ${rowData.person?.lastName}`}/>
            <Column field="roomId" header="Mieszkanie | Pokój"
                    body={(rowData: ContractDTO) => `${rowData.room?.apartment}  ${rowData.room?.number}`}
            />
            <Column field="startDate" header="Od kiedy"/>
            <Column field="endDate"
                    header="Do kiedy"
                    body={(rowData: ContractDTO) => (
                        <div className="flex gap-2 items-center">
                            {rowData.terminationDate ? (
                                <>
                                    <span className="line-through">{rowData.endDate}</span>
                                    <span className="text-red-500">{rowData.terminationDate}</span>
                                </>
                            ) : (
                                <span>{rowData.endDate}</span>
                            )}
                            {rowData.alreadyExpired && <Tag severity="danger" value="Już się skończył"/>}
                            {rowData.expiringSoon && <Tag severity="warning" value="Kończy się wkrótce"/>}
                        </div>
                    )}
            />
            <Column field="amount" header="Cena"/>
            <Column header="Akcje"
                    body={(rowData: ContractDTO) => (
                        <div className="flex gap-2">
                            <Button label="Szczegóły"
                                    icon="pi pi-eye"
                                    onClick={() => handleOpenDetailsDialog(rowData)}
                                    className="p-button-rounded p-button-sm"/>
                            <Button label="Edytuj"
                                    icon="pi pi-eye"
                                    disabled={rowData.status === ContractStatus.TERMINATED}
                                    onClick={() => handleOpenEditDialog(rowData)}
                                    className="p-button-rounded p-button-sm"/>
                            <Button label="Historia"
                                    icon="pi pi-history"
                                    severity="info"
                                    onClick={() => handleOpenHistoryDialog(rowData)}
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
