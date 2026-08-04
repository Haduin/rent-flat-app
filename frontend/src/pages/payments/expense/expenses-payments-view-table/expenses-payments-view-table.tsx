import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Tag} from "primereact/tag";
import {Button} from "primereact/button";
import {OperationalExpenseDTO} from "../../../../api/generated";
import {categorySeverity} from "../expenses-payments-view/expenses-payments-view.utils.ts";
import {ExpensesPaymentsViewTableProps} from "./expenses-payments-view-table.props.ts";
import {
    expensesMap
} from "../../../expenses-template/add-edit-expenses-template/add-edit-expenses-template-dialog.types.ts";


export const ExpensesPaymentsViewTable = ({
                                              expenses,
                                              removeAction,
                                          }: ExpensesPaymentsViewTableProps) => {


    const apartmentTemplate = (row: OperationalExpenseDTO) => row.apartmentDetails?.name ?? '-';
    const roomTemplate = (row: OperationalExpenseDTO) => row.roomDetails?.roomName ?? '-';
    const amountTemplate = (row: OperationalExpenseDTO) => `${row.amount.toFixed(2)} zł`;
    const categoryTemplate = (row: OperationalExpenseDTO) => expensesMap[row.category] ?? row.category;
    const costDateTemplate = (row: OperationalExpenseDTO) => row.costDate ?? '-';
    const insertDateTemplate = (row: OperationalExpenseDTO) => row.insertDate ?? '-';
    const invoiceNumberTemplate = (row: OperationalExpenseDTO) => row.invoiceNumber ?? '-';
    const descriptionTemplate = (row: OperationalExpenseDTO) => row.description ?? '-';

    const actionTemplate = (row: OperationalExpenseDTO) => (
        <div className="flex gap-2">
            <Button onClick={() => removeAction(row.id)}
                    name="Usuń"
            />
        </div>
    )


    const categoryBody = (row: OperationalExpenseDTO) => (
        <Tag severity={categorySeverity(row.category)} value={categoryTemplate(row)}/>
    );

    return (
        <DataTable
            value={expenses}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 20, 50]}
            stripedRows
            emptyMessage="Brak danych"
            style={{width: "100%"}}
        >
            <Column field="id" header="ID" sortable style={{width: "7%"}}/>
            <Column header="Mieszkanie" body={apartmentTemplate} sortable style={{width: "12%"}}/>
            <Column header="Pokój" body={roomTemplate} sortable style={{width: "10%"}}/>
            <Column field="category" header="Kategoria" body={categoryBody} sortable style={{width: "14%"}}/>
            <Column field="amount" header="Kwota" body={amountTemplate} sortable style={{width: "10%"}}/>
            <Column field="costDate" header="Termin płatności" body={costDateTemplate} sortable
                    style={{width: "11%"}}/>
            <Column field="insertDate" header="Data wpływu" body={insertDateTemplate} sortable
                    style={{width: "11%"}}/>
            <Column field="invoiceNumber" header="Numer faktury" body={invoiceNumberTemplate}
                    style={{width: "12%"}}/>
            <Column field="description" header="Opis" body={descriptionTemplate} style={{width: "15%"}}/>
            <Column header="Akcje" body={actionTemplate} style={{width: "8%"}}/>
        </DataTable>
    );
};