import React, {Suspense, useCallback, useState} from 'react';
import {SelectButton} from "primereact/selectbutton";
import {ProgressSpinner} from 'primereact/progressspinner';
import {paymentOptions, PaymentType} from "./payments-view.types.ts";

const IncomePaymentsView = React.lazy(() => import('./income/income-payments-view/income-payments-view.tsx'));
const ExpensePaymentsView = React.lazy(() => import('./expense/expenses-payments-view/expenses-payments-view.tsx'));


const PaymentsView = () => {
    const [paymentType, setPaymentType] = useState<PaymentType>()

    const renderPaymentView = useCallback(() => {
        switch (paymentType) {
            case 'income':
                return <IncomePaymentsView/>;
            case 'expense':
                return <ExpensePaymentsView/>;
            default:
                return null;
        }
    }, [paymentType]);


    return (
        <div>
            <div className="text-black p-2 flex flex-col gap-2">
                <SelectButton
                    value={paymentType}
                    options={paymentOptions}
                    onChange={(e) => setPaymentType(e.value)}
                />

            </div>

            <Suspense fallback={
                <div className="flex justify-content-center"><ProgressSpinner/></div>}>
                {renderPaymentView()}
            </Suspense>

        </div>
    );
};

export default PaymentsView;
