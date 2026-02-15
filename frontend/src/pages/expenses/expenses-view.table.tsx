import React from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import {OperationalExpense} from "../../components/commons/types.ts";

interface ExpensesTableProps {
    items?: OperationalExpense[];
    loading?: boolean;
    onEdit: (row: OperationalExpense) => void;
    onDelete: (id: number) => void;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({items, loading, onEdit, onDelete}) => {

    const roomTemplate = (row: OperationalExpense) => row.roomId ?? '-';
    const costDateTemplate = (row: OperationalExpense) => row.costDate ?? '-';
    const descriptionTemplate = (row: OperationalExpense) => row.description ?? '-';
    const invoiceTemplate = (row: OperationalExpense) => row.invoiceNumber ?? '-';
    const amountTemplate = (row: OperationalExpense) => `${row.amount.toFixed(2)} zł`;

    const actionsTemplate = (row: OperationalExpense) => (
        <div className="flex gap-2">
            <Button
                label="Edytuj"
                icon="pi pi-pencil"
                onClick={() => onEdit(row)}
                className="p-button-sm"
            />
            <Button
                label="Usuń"
                icon="pi pi-trash"
                severity="danger"
                onClick={() => onDelete(row.id)}
                className="p-button-sm"
            />
        </div>
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
            <Column field="id" header="ID" sortable style={{width: '8%'}} />
            <Column field="apartmentId" header="Mieszkanie" sortable style={{width: '10%'}} />
            <Column field="roomId" header="Pokój" body={roomTemplate} sortable style={{width: '10%'}} />
            <Column field="insertDate" header="Data wprowadzenia" sortable style={{width: '14%'}} />
            <Column field="costDate" header="Data kosztu" body={costDateTemplate} sortable style={{width: '14%'}} />
            <Column field="category" header="Kategoria" sortable style={{width: '14%'}} />
            <Column field="amount" header="Kwota" body={amountTemplate} sortable style={{width: '12%'}} />
            <Column field="description" header="Opis" body={descriptionTemplate} style={{width: '14%'}} />
            <Column field="invoiceNumber" header="Faktura" body={invoiceTemplate} style={{width: '12%'}} />
            <Column header="Akcje" body={actionsTemplate} style={{width: '16%'}} />
        </DataTable>
    );
};
