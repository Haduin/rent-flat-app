import {useState} from 'react';
import {dateToStringWithYearMonth} from "../../../../components/commons/dateFormatter";
import {Calendar} from "primereact/calendar";
import {Button} from "primereact/button";
import {ExpensesPaymentsViewTable} from "../expenses-payments-view-table/expenses-payments-view-table.tsx";
import {ProgressSpinner} from "primereact/progressspinner";
import {
    useExpensesBySelectedMonth,
    useGenerateExpensesFromTemplates,
    useRemoveExpense,
    useUpdateExpense
} from "../api/expenses-payments-view.api.ts";
import {OperationalExpenseDTO, UpdateOperationalExpenseDTO} from "../../../../api/generated";
import {ExpenseDetailsDialog} from "../expense-details-dialog/expense-details-dialog.tsx";
import {EditExpenseDialog} from "../edit-expense-dialog/edit-expense-dialog.tsx";
import {ConfirmationDialog} from "../../../../components/confirmation-dialog/confirmation-dialog.tsx";
import {useModal} from "../../../../hooks/use-modal";

const ExpensesPaymentsView = () => {

    const [dateSelected, setDateSelected] = useState<Date>();
    const [selectedExpense, setSelectedExpense] = useState<OperationalExpenseDTO | null>(null);

    const {expenses, isLoading} = useExpensesBySelectedMonth(dateSelected)
    const removeAction = useRemoveExpense()
    const updateAction = useUpdateExpense()
    const handleGenerate = useGenerateExpensesFromTemplates(dateSelected)

    const {isOpen: isDetailsDialogVisible, setOpen: setIsDetailsDialogVisible} = useModal()
    const {isOpen: isEditDialogVisible, setOpen: setIsEditDialogVisible} = useModal()
    const {isOpen: isDeleteDialogVisible, setOpen: setIsDeleteDialogVisible} = useModal()

    const handleDateSelectAndFetchPayments = (date: Date) => {
        setDateSelected(date);
    };

    const handleView = (expense: OperationalExpenseDTO) => {
        setSelectedExpense(expense);
        setIsDetailsDialogVisible(true);
    };

    const handleEdit = (expense: OperationalExpenseDTO) => {
        setSelectedExpense(expense);
        setIsEditDialogVisible(true);
    };

    const handleDelete = (expense: OperationalExpenseDTO) => {
        setSelectedExpense(expense);
        setIsDeleteDialogVisible(true);
    };

    const closeDialogs = () => {
        setIsDetailsDialogVisible(false);
        setIsEditDialogVisible(false);
        setIsDeleteDialogVisible(false);
        setSelectedExpense(null);
    };

    const getSelectedExpenseLabel = (expense: OperationalExpenseDTO | null) => {
        if (!expense) return '';
        const target = expense.roomDetails?.roomName ?? expense.apartmentDetails?.name ?? 'ogólny';
        return `${target} - ${expense.amount.toFixed(2)} zł`;
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
                              locale="pl"
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
                    <ExpensesPaymentsViewTable
                        expenses={expenses}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            )}
            <ExpenseDetailsDialog
                isVisible={isDetailsDialogVisible}
                onHide={closeDialogs}
                selectedExpense={selectedExpense}
            />
            <EditExpenseDialog
                isVisible={isEditDialogVisible}
                onHide={closeDialogs}
                selectedExpense={selectedExpense}
                onConfirm={(dto: UpdateOperationalExpenseDTO) => updateAction.mutate(dto, {onSuccess: closeDialogs})}
            />
            <ConfirmationDialog
                title={`Czy na pewno chcesz usunąć wydatek: ${getSelectedExpenseLabel(selectedExpense)}?`}
                isOpen={isDeleteDialogVisible}
                onClose={closeDialogs}
                onConfirm={() => {
                    if (selectedExpense) removeAction.mutate(selectedExpense.id, {onSuccess: closeDialogs});
                }}
                confirmLabel="Usuń"
                cancelLabel="Anuluj"
            />
        </div>
    );
};

export default ExpensesPaymentsView;
