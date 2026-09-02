import React from 'react';
import {DataTable, DataTableStateEvent} from 'primereact/datatable';
import {Column} from 'primereact/column';
import PaymentStatusTag from "../../../../components/commons/payment-status-tag/payment-status-tag.tsx";
import {Button} from "primereact/button";
import {fieldMapping} from "./income-payments-view.hook.ts";
import {PaymentSortableField} from "./income-payments.model.ts";
import {SortOrder} from "primereact/api";
import {PaymentHistoryWithPersonDTO, PaymentStatus} from "../../../../api/generated";

interface PaymentsTableProps {
    payments?: PaymentHistoryWithPersonDTO[],
    openConfirmationDialog: (payment: PaymentHistoryWithPersonDTO) => void,
    openEditDialog: (payment: PaymentHistoryWithPersonDTO) => void,
    openSplitDialog: (payment: PaymentHistoryWithPersonDTO) => void,
    handleTableSort?: (event: DataTableStateEvent) => void,
    sortState?: { field?: PaymentSortableField; order?: SortOrder }
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
                                                                payments,
                                                                openConfirmationDialog,
                                                                openEditDialog,
                                                                openSplitDialog,
                                                                handleTableSort,
                                                                sortState
                                                            }) => {
    const payerNameTemplate = (rowData: PaymentHistoryWithPersonDTO) =>
        `${rowData.person?.firstName} ${rowData.person?.lastName}`;

    const flatTemplate = (rowData: PaymentHistoryWithPersonDTO) =>
        `${rowData.room?.apartment}`

    const amountTemplate = (rowData: PaymentHistoryWithPersonDTO) =>
        rowData.status === PaymentStatus.Cancelled ?
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

    const dateTemplate = (rowData: PaymentHistoryWithPersonDTO) => rowData.payedDate;

    const statusTemplate = (rowData: PaymentHistoryWithPersonDTO) =>
        <PaymentStatusTag status={rowData.status}/>;

    const actionsTemplate = (rowData: PaymentHistoryWithPersonDTO) => {
        if (rowData.status !== PaymentStatus.Paid && rowData.status !== PaymentStatus.Cancelled) {
            return (
                <div className="flex gap-2">
                    <Button
                        label="Potwierdz"
                        icon="pi pi-pencil"
                        onClick={() => openConfirmationDialog(rowData)}
                        className="p-button-rounded p-button-sm"
                    />
                    <Button
                        label="Podziel płatność"
                        icon="pi pi-percentage"
                        onClick={() => openSplitDialog(rowData)}
                        className="p-button-rounded p-button-sm p-button-outlined"
                    />
                </div>
            );
        }
        if (rowData.status === PaymentStatus.Paid || rowData.status === PaymentStatus.Cancelled) {
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

    return (
        <DataTable
            value={payments}
            paginator
            rowsPerPageOptions={[5, 10, 20, 50]}
            rows={10}
            stripedRows
            sortField={
                Object.entries(fieldMapping).find(
                    ([, value]) => value === sortState?.field
                )?.[0]
            }
            sortOrder={
                sortState?.order
            }

            onSort={handleTableSort}
            style={{width: '100%'}}
            emptyMessage="Brak płatności do wyświetlenia"
        >
            <Column
                field="payerName"
                header="Płatnik"
                body={payerNameTemplate}
                style={{width: '20%'}}
                sortable
            />
            <Column
                field="flat"
                header="Mieszkanie"
                body={flatTemplate}
                sortable
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
                style={{width: '25%'}}
            />
        </DataTable>
    );
};