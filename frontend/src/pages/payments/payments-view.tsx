import {ProgressSpinner} from 'primereact/progressspinner';
import {Calendar} from "primereact/calendar";
import {Button} from "primereact/button";
import ConfirmPaymentDialog from "./confirm-payment-dialog.tsx";
import {usePaymentsView} from "./payments-view.hook.ts";
import {dateToStringFullYearMouthDay, dateToStringWithYearMonth} from "../../components/commons/dateFormatter.ts";
import {PaymentsTable} from "./payments-view.table.tsx";


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
        <div>
            <div className="text-black p-2 flex flex-col gap-2">
                <h3 className="">Historia Płatności</h3>
                <Calendar className=""
                          value={dateSelected}
                          onChange={(e) => handleDateSelectAndFetchPayments(e.value as Date)}
                          view="month"
                          dateFormat="yy-mm"/>

                {dateSelected && (
                    <Button
                        className="p-button-raised"
                        onClick={() => handleGenerateNewMonthPayments.mutate()}
                        label={`Wygeneruj płatności za ten miesiąc: ${dateToStringWithYearMonth(dateSelected)}`}/>
                )}
            </div>


            {loading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div className="p-2">
                    <PaymentsTable
                        openConfirmationDialog={openConfirmationDialog}
                        payments={payments}
                    />
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
