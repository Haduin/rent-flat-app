import {ProgressSpinner} from 'primereact/progressspinner';
import {Calendar} from "primereact/calendar";
import {Button} from "primereact/button";
import {usePaymentsView} from "./income-payments-view.hook.ts";
import {dateToStringWithYearMonth} from "../../../../components/commons/dateFormatter.ts";
import {PaymentsTable} from "./income-payments-view.table.tsx";
import {IncomeEditPaymentDialog} from "../income-edit-payment-dialog/income-edit-payment-dialog.tsx";
import {IncomeConfirmPaymentDialog} from "../income-confirm-payment-dialog/income-confirm-payment-dialog.tsx";
import {IncomeSplitPaymentDialog} from "../income-split-payment-dialog/income-split-payment-dialog.tsx";


const IncomePaymentsView = () => {


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
        isSplitDialogVisible,
        openSplitDialog,
        closeSplitDialog,
        handleSplitPayment,
        handleGenerateNewMonthPayments,
        isEditPaymentVisible,
        openEditDialog,
        closeEditDialog,
        handleEditPayment,
        handleTableSort,
        sortState
    } = usePaymentsView()

    return (
        <div>
            <div className="text-black p-2 flex flex-col gap-2">
                <h3 className="">Historia Płatności</h3>
                <div>
                    <Calendar className="w-1/2"
                              value={dateSelected}
                              onChange={(e) => handleDateSelectAndFetchPayments(e.value as Date)}
                              view="month"
                              locale="pl"
                              dateFormat="yy-mm"/>

                    {dateSelected && (
                        <Button
                            className="w-1/2 p-button-raised"
                            onClick={() => handleGenerateNewMonthPayments.mutate()}
                            label={`Wygeneruj płatności za ten miesiąc: ${dateToStringWithYearMonth(dateSelected)}`}/>
                    )}
                </div>
            </div>


            {loading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div className="p-2">

                    <PaymentsTable
                        openConfirmationDialog={openConfirmationDialog}
                        openEditDialog={openEditDialog}
                        openSplitDialog={openSplitDialog}
                        payments={payments}
                        handleTableSort={handleTableSort}
                        sortState={sortState}
                    />
                    <IncomeConfirmPaymentDialog
                        isVisible={isConfirmationDialogVisible}
                        onHide={closeConfirmationDialog}
                        onConfirm={handleConfirmPayment}
                        selectedPayment={selectedPayment}
                    />
                    <IncomeSplitPaymentDialog
                        isVisible={isSplitDialogVisible}
                        onHide={closeSplitDialog}
                        onConfirm={handleSplitPayment}
                        selectedPayment={selectedPayment}
                    />
                    <IncomeEditPaymentDialog
                        onHide={closeEditDialog}
                        selectedPayment={selectedPayment}
                        isVisible={isEditPaymentVisible}
                        onConfirm={handleEditPayment}
                    />
                </div>
            )}
        </div>
    );
};

export default IncomePaymentsView;
