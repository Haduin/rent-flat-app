import React from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Payment, Status} from "../../components/commons/types.ts";
import StatusTag from "../../components/commons/status-tag/status-tag.tsx";
import {Button} from "primereact/button";

interface PaymentsTableProps {
    payments?: Payment[];
    openConfirmationDialog: (payment: Payment) => void;
    openEditDialog: (payment: Payment) => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
                                                                payments,
                                                                openConfirmationDialog,
                                                                openEditDialog
                                                            }) => {
    const payerNameTemplate = (rowData: Payment) =>
        `${rowData.person.firstName} ${rowData.person.lastName}`;

    const amountTemplate = (rowData: Payment) =>
        rowData.status === Status.CANCELLED ?
            <span className="line-through">{rowData.amount}</span> :
            <div>{rowData.amount}</div>;

    // const amountFooterTemplate = () => {
    //     if (!payments) return null;
    //
    //     const total = payments
    //         .filter(payment => payment.status !== Status.CANCELLED)
    //         .reduce((sum, payment) => sum + payment.amount, 0);
    //     return <div>{formatCurrency(total)}</div>;
    // };

    const dateTemplate = (rowData: Payment) => rowData.payedDate;

    const statusTemplate = (rowData: Payment) =>
        <StatusTag status={rowData.status}/>;

    const actionsTemplate = (rowData: Payment) => {
        if (rowData.status !== Status.PAID && rowData.status !== Status.CANCELLED) {
            return (
                <Button
                    label="Potwierdz"
                    icon="pi pi-pencil"
                    onClick={() => openConfirmationDialog(rowData)}
                    className="p-button-rounded p-button-sm"
                />
            );
        }
        if (rowData.status === Status.PAID || rowData.status === Status.CANCELLED) {
            return (
                <Button
                    label="Edytuj"
                    icon="pi pi-pencil"
                    onClick={() => openEditDialog(rowData)}
                />
            )

        }
        return null;
    };

    const customDateSort = (event: any) => {
        const {data, order} = event;
        return [...data].sort((a, b) => {
            const dateA = a.payedDate ? new Date(a.payedDate).getTime() : 0;
            const dateB = b.payedDate ? new Date(b.payedDate).getTime() : 0;
            return order === 1 ? dateA - dateB : dateB - dateA;
        });
    };

    return (
        <DataTable
            value={payments}
            paginator
            rowsPerPageOptions={[5, 10, 20, 50]}
            rows={10}
            stripedRows
            style={{width: '100%'}}
            emptyMessage="Brak płatności do wyświetlenia"
        >
            <Column
                field="payerName"
                header="Płatnik"
                body={payerNameTemplate}
                style={{width: '20%'}}
            />
            <Column
                field="amount"
                header="Kwota"
                sortable
                body={amountTemplate}
                // footer={amountFooterTemplate}
                // footerClassName="bg-green-100"
                style={{width: '20%'}}
            />
            <Column
                field="date"
                header="Data"
                sortable
                sortFunction={customDateSort}
                body={dateTemplate}
                style={{width: '20%'}}
            />
            <Column
                field="status"
                header="Status"
                sortable
                body={statusTemplate}
            />
            <Column
                header="Akcje"
                body={actionsTemplate}
                style={{width: '15%'}}
            />
        </DataTable>
    );
};