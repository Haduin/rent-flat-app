import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import {Tag} from "primereact/tag";
import {getExpenseCategoryLabel} from "../enum/expenses.enum.ts";
import {ExpensesTableProps} from "./expenses-template-view-table.props.ts";
import {OperationalExpenseTemplateResponse} from "../../../api/generated";
import {categorySeverity} from "./expenses-template-view.table.consts.ts";


export const ExpensesTable = ({
                                  items,
                                  loading,
                                  handleOnExpenseEdit
                              }: ExpensesTableProps) => {


    const apartmentTemplate = (row: OperationalExpenseTemplateResponse) => {
        if (row.apartment) {
            return row.apartment.name
        }
        return '-'
    }
    const roomTemplate = (row: OperationalExpenseTemplateResponse) => {
        if (row.room) {
            return row.room.name
        }
        return '-'
    }
    const amountTemplate = (row: OperationalExpenseTemplateResponse) => `${row.amount.toFixed(2)} zł`;
    const dayOfMonthTemplate = (row: OperationalExpenseTemplateResponse) => `${row.dayOfMonth} dzień miesiąca`;

    const categoryTemplate = (row: OperationalExpenseTemplateResponse) => {
        return getExpenseCategoryLabel(row.category);
    };

    const activeTemplate = (row: OperationalExpenseTemplateResponse) => (
        <Tag
            severity={row.active ? 'success' : 'danger'}
            value={row.active ? 'Aktywny' : 'Nieaktywny'}
        />
    );

    const actionsTemplate = (row: OperationalExpenseTemplateResponse) => (
        <div className="flex gap-2">
            <Button
                label="Edytuj"
                icon="pi pi-pencil"
                className="p-button-sm"
                onClick={() => {
                    handleOnExpenseEdit(row)
                }}
            />
            <Button
                label="Usuń"
                icon="pi pi-trash"
                severity="danger"
                className="p-button-sm"
            />
        </div>
    );


    const categoryBody = (row: OperationalExpenseTemplateResponse) => (
        <Tag severity={categorySeverity(row.category)} value={categoryTemplate(row)}/>
    );

    return (
        <DataTable
            value={items}
            paginator
            rowsPerPageOptions={[5, 10, 20, 50]}
            rows={10}
            stripedRows
            loading={loading}
            style={{width: '100%'}}
            emptyMessage="Brak wydatków do wyświetlenia"
        >
            <Column field="id" header="ID" sortable style={{width: '8%'}}/>
            <Column field="apartmentId" header="Mieszkanie" body={apartmentTemplate} sortable style={{width: '10%'}}/>
            <Column field="roomId" header="Pokój" body={roomTemplate} sortable style={{width: '10%'}}/>
            <Column field="category" header="Kategoria" body={categoryBody} sortable style={{width: '16%'}}/>
            <Column field="amount" header="Kwota" body={amountTemplate} sortable style={{width: '12%'}}/>
            <Column field="dayOfMonth" header="Dzień płatności" body={dayOfMonthTemplate} sortable
                    style={{width: '14%'}}/>
            <Column field="active" header="Status" body={activeTemplate} sortable style={{width: '10%'}}/>
            <Column header="Akcje" body={actionsTemplate} style={{width: '16%'}}/>

        </DataTable>
    );
};
