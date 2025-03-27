import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {ProgressSpinner} from 'primereact/progressspinner';
import {Calendar} from "primereact/calendar";
import {formatCurrency} from "../commons/currencyFormatter.ts";
import {Payment, Status} from "../commons/types.ts";
import StatusTag from "../commons/status-tag/status-tag.tsx";
import {Button} from "primereact/button";
import ConfirmPaymentDialog from "./confirm-payment-dialog.tsx";
import {usePaymentsView} from "./payments-view.hook.ts";
import {dateToStringFullYearMouthDay, dateToStringWithYearMonth} from "../commons/dateFormatter.ts";


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
            <div className="text-black p-2">
                <h2>Historia Płatności</h2>
            </div>
            <div className="flex justify-content-center">
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
                <div>
                    <DataTable value={payments} paginator rows={10} stripedRows>
                        {/*<Column field="id" header="ID" style={{width: '10%'}}></Column>*/}
                        <Column field="payerName" header="Płatnik" style={{width: '20%'}}
                                body={(rowData: Payment) => `${rowData.person.firstName} ${rowData.person.lastName}`}>
                        </Column>
                        <Column
                            field="amount"
                            header="Kwota"
                            body={(rowData: Payment) => formatCurrency(rowData.amount)}
                            style={{width: '20%'}}
                        ></Column>
                        <Column
                            field="date"
                            header="Data"
                            body={(rowData: Payment) => rowData.payedDate}
                            style={{width: '20%'}}
                        />
                        <Column
                            field="status"
                            header="Status"
                            body={(rowData: Payment) => <StatusTag status={rowData.status}/>}
                        />
                        <Column header="Akcje"
                                body={(rowData: Payment) =>
                                    rowData.status !== Status.PAID ? (
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