import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {ProgressSpinner} from 'primereact/progressspinner';
import {Calendar} from "primereact/calendar";
import {formatCurrency} from "../../components/commons/currencyFormatter.ts";
import {Payment, Status} from "../../components/commons/types.ts";
import StatusTag from "../../components/commons/status-tag/status-tag.tsx";
import {Button} from "primereact/button";
import ConfirmPaymentDialog from "./confirm-payment-dialog.tsx";
import {usePaymentsView} from "./payments-view.hook.ts";
import {dateToStringFullYearMouthDay, dateToStringWithYearMonth} from "../../components/commons/dateFormatter.ts";


const PaymentsView = () => {

    const {
        payments,
        loading,
        dateSelected,
        selectedPayment,
        isConfirmationDialogVisible,
        handleDateSelectAndFetchPayments,
        openConfirmationDialog,
        closeConfirmationDialog,
        handleConfirmPayment,
        handleGenerateNewMonthPayments
    } = usePaymentsView()


    return (
        <div className="card">
            <div className="text-black p-1">
                <h3>Historia Płatności</h3>
                <Calendar value={dateSelected}
                          onChange={(e) => handleDateSelectAndFetchPayments(e.value as Date)}
                          view="month"
                          dateFormat="yy-mm"/>
                {dateSelected && (
                    <Button
                        onClick={() => handleGenerateNewMonthPayments.mutate()}
                        label={`Wygeneruj płatności za ten miesiąc : ${dateToStringWithYearMonth(dateSelected)}`}/>
                )}
            </div>

            {loading || handleGenerateNewMonthPayments.isPending || handleConfirmPayment.isPending ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div className="p-2">
                    <DataTable value={payments}
                               paginator
                               rowsPerPageOptions={[5, 10, 20, 50]}
                               rows={10}
                               stripedRows
                               style={{width: '100%'}}
                    >
                        {/*<Column field="id" header="ID" style={{width: '10%'}}></Column>*/}
                        <Column field="payerName" header="Płatnik" style={{width: '20%'}}
                                body={(rowData: Payment) => `${rowData.person.firstName} ${rowData.person.lastName}`}>
                        </Column>
                        <Column
                            sortable
                            field="amount"
                            header="Kwota"
                            body={(rowData: Payment) => rowData.status === Status.CANCELLED ?
                                <span className="line-through">{rowData.amount}</span> :
                                <div>{rowData.amount}</div>}
                            footer={payments && payments.length > 0 ? () => formatCurrency(payments.filter(payment => payment.status !== Status.CANCELLED).reduce((sum, payment) => sum + payment.amount, 0)) : undefined}
                            footerClassName="bg-green-100"
                            style={{width: '20%'}}
                        />
                        <Column
                            sortable
                            sortFunction={(event) => {
                                const {data, order} = event;
                                return [...data].sort((a, b) => {
                                    const dateA = a.payedDate ? new Date(a.payedDate).getTime() : 0;
                                    const dateB = b.payedDate ? new Date(b.payedDate).getTime() : 0;
                                    return order === 1 ? dateA - dateB : dateB - dateA;
                                });
                            }}

                            field="date"
                            header="Data"
                            body={(rowData: Payment) => rowData.payedDate}
                            style={{width: '20%'}}
                        />
                        <Column
                            sortable
                            field="status"
                            header="Status"
                            body={(rowData: Payment) => <StatusTag status={rowData.status}/>}
                        />
                        <Column header="Akcje"
                                body={(rowData: Payment) =>
                                    (rowData.status !== Status.PAID && rowData.status !== Status.CANCELLED) ? (
                                        <Button label="Potwierdz"
                                                icon="pi pi-pencil"
                                                onClick={() => openConfirmationDialog(rowData)}
                                                className="p-button-rounded p-button-sm"/>
                                    ) : <></>
                                }
                        />

                    </DataTable>
                    <ConfirmPaymentDialog
                        isVisible={isConfirmationDialogVisible}
                        onHide={closeConfirmationDialog}
                        onConfirm={async (date: Date, paymentId: number, amount: number) => {
                            closeConfirmationDialog()
                            handleConfirmPayment.mutate({
                                paymentId: paymentId,
                                paymentDate: dateToStringFullYearMouthDay(date),
                                payedAmount: amount
                            })
                        }

                        }
                        selectedPayment={selectedPayment}
                    />
                </div>
            )}
        </div>
    );
};

export default PaymentsView;
