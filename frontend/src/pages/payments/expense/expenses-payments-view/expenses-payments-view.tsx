import {useState} from 'react';
import {dateToStringWithYearMonth} from "../../../../components/commons/dateFormatter";
import {Calendar} from "primereact/calendar";
import {Button} from "primereact/button";
import {ExpensesPaymentsViewTable} from "../expenses-payments-view-table/expenses-payments-view-table.tsx";
import {ProgressSpinner} from "primereact/progressspinner";
import {
    useExpensesBySelectedMonth,
    useGenerateExpensesFromTemplates,
    useRemoveExpense
} from "../api/expenses-payments-view.api.ts";

const ExpensesPaymentsView = () => {

    const [dateSelected, setDateSelected] = useState<Date>();

    const {expenses, isLoading} = useExpensesBySelectedMonth(dateSelected)
    const removeAction = useRemoveExpense()
    const handleGenerate = useGenerateExpensesFromTemplates(dateSelected)

    const handleDateSelectAndFetchPayments = (date: Date) => {
        setDateSelected(date);
    };


    return (
        <div>
            <h1>Wydatki</h1>
            <div className="text-black p-2 flex flex-col gap-2">
                <h3 className="">Historia Płatności</h3>
                <div>
                    <Calendar className="w-1/2"
                              value={dateSelected}
                              onChange={(e) => handleDateSelectAndFetchPayments(e.value as Date)}
                              view="month"
                              dateFormat="yy-mm"/>

                    {dateSelected && (
                        <Button
                            className="w-1/2 p-button-raised"
                            onClick={() => handleGenerate.mutate()}
                            label={`Wygeneruj płatności za ten miesiąc: ${dateToStringWithYearMonth(dateSelected)}`}/>
                    )}
                </div>
            </div>
            {isLoading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div className="p-2">
                    <ExpensesPaymentsViewTable expenses={expenses} removeAction={removeAction.mutate}/>
                </div>
            )}
        </div>
    );
};

export default ExpensesPaymentsView;
