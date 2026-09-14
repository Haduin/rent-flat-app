import {useState} from "react";
import {Column} from "primereact/column";
import {Calendar} from "primereact/calendar";
import {Tag} from "primereact/tag";
import {
    useConfirmExpense,
    useExpensesBySelectedMonth,
    useGenerateExpensesFromTemplates,
    useRemoveExpense,
    useUpdateExpense,
} from "../../../src/pages/payments/expense/api/expenses-payments-view.api.ts";
import {
    categorySeverity,
    EXPENSE_STATUS_LABEL,
    expenseStatusSeverity,
} from "../../../src/pages/payments/expense/expenses-payments-view/expenses-payments-view.utils.ts";
import {expensesMap} from "../../../src/pages/expenses-template/add-edit-expenses-template/add-edit-expenses-template-dialog.types.ts";
import {ExpenseDetailsDialog} from "../../../src/pages/payments/expense/expense-details-dialog/expense-details-dialog.tsx";
import {EditExpenseDialog} from "../../../src/pages/payments/expense/edit-expense-dialog/edit-expense-dialog.tsx";
import {ExpenseConfirmDialog} from "../../../src/pages/payments/expense/expense-confirm-dialog/expense-confirm-dialog.tsx";
import {ConfirmationDialog} from "../../../src/components/confirmation-dialog/confirmation-dialog.tsx";
import {useModal} from "../../../src/hooks/use-modal";
import {dateToStringFullYearMouthDay, dateToStringWithYearMonth} from "../../../src/components/commons/dateFormatter.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {PageHeader} from "../../components/ui/PageHeader.tsx";
import {Card} from "../../components/ui/Card.tsx";
import {DataTableCard} from "../../components/ui/DataTableCard.tsx";
import {Button} from "../../components/ui/Button.tsx";
import {OperationalExpenseDTO, PaymentStatus, UpdateOperationalExpenseDTO} from "../../../src/api/generated";
import {isNotEqual} from "../../../src/utils/typeguards";

const ExpensePaymentsPage = () => {
    const [dateSelected, setDateSelected] = useState<Date>();
    const [selectedExpense, setSelectedExpense] = useState<OperationalExpenseDTO | null>(null);

    const {expenses, isLoading} = useExpensesBySelectedMonth(dateSelected);
    const removeAction = useRemoveExpense();
    const updateAction = useUpdateExpense();
    const confirmAction = useConfirmExpense();
    const handleGenerate = useGenerateExpensesFromTemplates(dateSelected);

    const {isOpen: isDetailsDialogVisible, setOpen: setIsDetailsDialogVisible} = useModal();
    const {isOpen: isEditDialogVisible, setOpen: setIsEditDialogVisible} = useModal();
    const {isOpen: isDeleteDialogVisible, setOpen: setIsDeleteDialogVisible} = useModal();
    const {isOpen: isConfirmDialogVisible, setOpen: setIsConfirmDialogVisible} = useModal();

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
    const handleConfirm = (expense: OperationalExpenseDTO) => {
        setSelectedExpense(expense);
        setIsConfirmDialogVisible(true);
    };
    const closeDialogs = () => {
        setIsDetailsDialogVisible(false);
        setIsEditDialogVisible(false);
        setIsDeleteDialogVisible(false);
        setIsConfirmDialogVisible(false);
        setSelectedExpense(null);
    };

    const handleConfirmExpense = (date: Date, expenseId: number, amount: number) => {
        closeDialogs();
        confirmAction.mutate({
            expenseId,
            paidDate: dateToStringFullYearMouthDay(date),
            payedAmount: amount,
        });
    };

    const getSelectedExpenseLabel = (expense: OperationalExpenseDTO | null) => {
        if (!expense) return "";
        const target = expense.roomDetails?.roomName ?? expense.apartmentDetails?.name ?? "ogólny";
        return `${target} - ${expense.amount.toFixed(2)} zł`;
    };

    const categoryBody = (row: OperationalExpenseDTO) => (
        <Tag severity={categorySeverity(row.category)} value={expensesMap[row.category] ?? row.category}/>
    );

    const statusBody = (row: OperationalExpenseDTO) => (
        <Tag severity={expenseStatusSeverity(row.status)} value={EXPENSE_STATUS_LABEL[row.status] ?? row.status}/>
    );

    const actionsBody = (row: OperationalExpenseDTO) => {
        const canConfirm = isNotEqual(PaymentStatus.Paid, row.status) && isNotEqual(PaymentStatus.Cancelled, row.status);
        return (
            <div style={{display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap"}}>
                {canConfirm && (
                    <Button variant="primary" size="small" onClick={() => handleConfirm(row)}>
                        Potwierdź
                    </Button>
                )}
                <Button variant="secondary" size="small" icon="pi pi-eye" onClick={() => handleView(row)}/>
                <Button variant="secondary" size="small" icon="pi pi-pencil" onClick={() => handleEdit(row)}/>
                <Button variant="danger-outline" size="small" icon="pi pi-trash" onClick={() => handleDelete(row)}/>
            </div>
        );
    };

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 20}}>
            <PageHeader title="Koszty operacyjne" subtitle="Media, podatki, czynsz do właściciela"/>

            <Card padding={20} style={{display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap"}}>
                <Calendar
                    value={dateSelected}
                    onChange={(event) => setDateSelected(event.value as Date)}
                    view="month"
                    locale="pl"
                    dateFormat="yy-mm"
                    placeholder="Wybierz miesiąc"
                />
                {dateSelected && (
                    <Button variant="primary" onClick={() => handleGenerate.mutate()}>
                        Wygeneruj koszty za {dateToStringWithYearMonth(dateSelected)}
                    </Button>
                )}
            </Card>

            <DataTableCard value={expenses} loading={isLoading} emptyMessage="Brak danych">
                <Column header="Mieszkanie" body={(row: OperationalExpenseDTO) => row.apartmentDetails?.name ?? "-"} sortable/>
                <Column header="Pokój" body={(row: OperationalExpenseDTO) => row.roomDetails?.roomName ?? "-"} sortable/>
                <Column header="Kategoria" body={categoryBody} sortable field="category"/>
                <Column header="Kwota" body={(row: OperationalExpenseDTO) => formatCurrency(row.amount)} sortable field="amount"/>
                <Column header="Termin płatności" body={(row: OperationalExpenseDTO) => row.costDate ?? "-"} sortable field="costDate"/>
                <Column header="Data wpływu" body={(row: OperationalExpenseDTO) => row.insertDate ?? "-"} sortable field="insertDate"/>
                <Column header="Status" body={statusBody} sortable field="status"/>
                <Column header="Nr faktury" body={(row: OperationalExpenseDTO) => row.invoiceNumber ?? "-"}/>
                <Column header="Opis" body={(row: OperationalExpenseDTO) => row.description ?? "-"}/>
                <Column header="" body={actionsBody} style={{width: 220}}/>
            </DataTableCard>

            <ExpenseDetailsDialog isVisible={isDetailsDialogVisible} onHide={closeDialogs} selectedExpense={selectedExpense}/>
            <EditExpenseDialog
                isVisible={isEditDialogVisible}
                onHide={closeDialogs}
                selectedExpense={selectedExpense}
                onConfirm={(dto: UpdateOperationalExpenseDTO) => updateAction.mutate(dto, {onSuccess: closeDialogs})}
            />
            <ExpenseConfirmDialog
                isVisible={isConfirmDialogVisible}
                onHide={closeDialogs}
                selectedExpense={selectedExpense}
                onConfirm={handleConfirmExpense}
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

export default ExpensePaymentsPage;
