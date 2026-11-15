import {useState} from "react";
import {
    useAddExpense,
    useConfirmExpense,
    useExpensesBySelectedMonth,
    useGenerateExpensesFromTemplates,
    useRemoveExpense,
    useUpdateExpense,
} from "../../../src/pages/payments/expense/api/expenses-payments-view.api.ts";
import {expensesMap} from "../../../src/pages/expenses-template/add-edit-expenses-template/add-edit-expenses-template-dialog.types.ts";
import {AddExpenseDialog, ConfirmExpenseDialog, confirmDeleteExpense, EditExpenseDialog, ExpenseDetailsDialog} from "./ExpenseDialogs.tsx";
import {useModal} from "../../../src/hooks/use-modal";
import {getApartments} from "../../../src/pages/apartment/api/apartments.api.ts";
import {dateToStringFullYearMouthDay} from "../../../src/components/commons/dateFormatter.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {Page} from "../../components/layout/Page.tsx";
import {DataTableCard, DataTableColumn} from "../../components/ui/DataTableCard.tsx";
import {Button} from "../../components/ui/Button.tsx";
import {IconPlus} from "../../components/ui/icons.tsx";
import {Badge} from "../../components/ui/Badge.tsx";
import {EXPENSE_CATEGORY_TONE} from "../../components/ui/expense-category.ts";
import {PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE} from "../../components/ui/payment-status.ts";
import {MonthSettlementSummary} from "../../components/ui/MonthSettlementSummary.tsx";
import {formatDatePl} from "../../utils/date.ts";
import {NewOperationalExpenseDTO, OperationalExpenseDTO, PaymentStatus, UpdateOperationalExpenseDTO} from "../../../src/api/generated";
import {isNotEqual} from "../../../src/utils/typeguards";
import {formatMonthLabel, useCurrentMonth} from "../../components/layout/CurrentMonth.ts";

// today when the selected month is the current one, else its first day: the cost lands in the month on screen
const defaultDueDate = (month: Date) => {
    const today = new Date();
    const sameMonth = today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth();
    return sameMonth ? today : new Date(month.getFullYear(), month.getMonth(), 1);
};

const ExpensePaymentsPage = () => {
    const {month: dateSelected} = useCurrentMonth();
    const [selectedExpense, setSelectedExpense] = useState<OperationalExpenseDTO | null>(null);

    const {expenses, isLoading} = useExpensesBySelectedMonth(dateSelected);
    const removeAction = useRemoveExpense();
    const updateAction = useUpdateExpense();
    const confirmAction = useConfirmExpense();
    const handleGenerate = useGenerateExpensesFromTemplates(dateSelected);
    const addAction = useAddExpense();
    const {isOpen: isAddDialogVisible, setOpen: setIsAddDialogVisible} = useModal();
    const {data: apartments = []} = getApartments({enabled: isAddDialogVisible});

    const {isOpen: isDetailsDialogVisible, setOpen: setIsDetailsDialogVisible} = useModal();
    const {isOpen: isEditDialogVisible, setOpen: setIsEditDialogVisible} = useModal();
    const {isOpen: isConfirmDialogVisible, setOpen: setIsConfirmDialogVisible} = useModal();

    const handleView = (expense: OperationalExpenseDTO) => {
        setSelectedExpense(expense);
        setIsDetailsDialogVisible(true);
    };
    const handleEdit = (expense: OperationalExpenseDTO) => {
        setSelectedExpense(expense);
        setIsEditDialogVisible(true);
    };
    const handleDelete = (expense: OperationalExpenseDTO) =>
        confirmDeleteExpense(expense, () => removeAction.mutate(expense.id));
    const handleConfirm = (expense: OperationalExpenseDTO) => {
        setSelectedExpense(expense);
        setIsConfirmDialogVisible(true);
    };
    const closeDialogs = () => {
        setIsDetailsDialogVisible(false);
        setIsEditDialogVisible(false);
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

    const categoryBody = (row: OperationalExpenseDTO) => (
        <Badge tone={EXPENSE_CATEGORY_TONE[row.category]}>{expensesMap[row.category] ?? row.category}</Badge>
    );

    const statusBody = (row: OperationalExpenseDTO) => (
        <Badge tone={PAYMENT_STATUS_TONE[row.status]}>{PAYMENT_STATUS_LABEL[row.status]}</Badge>
    );

    const rowActions = (row: OperationalExpenseDTO) => {
        const canConfirm = isNotEqual(PaymentStatus.Paid, row.status) && isNotEqual(PaymentStatus.Cancelled, row.status);
        return (
            <>
                {canConfirm && (
                    <Button variant="primary" size="small" onClick={() => handleConfirm(row)}>
                        Potwierdź
                    </Button>
                )}
                <Button variant="secondary" size="small" icon="pi pi-eye" aria-label="Szczegóły kosztu" onClick={() => handleView(row)}/>
                <Button variant="secondary" size="small" icon="pi pi-pencil" aria-label="Edytuj koszt" onClick={() => handleEdit(row)}/>
                <Button variant="danger-outline" size="small" icon="pi pi-trash" aria-label="Usuń koszt" onClick={() => handleDelete(row)}/>
            </>
        );
    };

    const columns: DataTableColumn<OperationalExpenseDTO>[] = [
        {header: "Mieszkanie", body: (row) => row.apartmentDetails?.name ?? "-", sortable: true, field: "apartmentDetails.name"},
        {header: "Pokój", body: (row) => row.roomDetails?.roomName ?? "-", sortable: true, field: "roomDetails.roomName"},
        {header: "Kategoria", body: categoryBody, sortable: true, field: "category"},
        {header: "Kwota", body: (row) => formatCurrency(row.amount), sortable: true, field: "amount"},
        // insertDate is the due date generated from the template's day of month
        {header: "Termin płatności", body: (row) => formatDatePl(row.insertDate), sortable: true, field: "insertDate"},
        {header: "Data zapłaty", body: (row) => formatDatePl(row.paidDate), sortable: true, field: "paidDate", optional: true},
        {header: "Status", body: statusBody, sortable: true, field: "status"},
        {header: "Nr faktury", body: (row) => row.invoiceNumber ?? "-", optional: true},
    ];

    return (
        <Page
            title="Koszty operacyjne"
            subtitle="Media, podatki, czynsz do właściciela"
            actions={
                <>
                    <Button
                        variant={(expenses?.length ?? 0) > 0 ? "secondary" : "primary"}
                        loading={handleGenerate.isPending}
                        onClick={() => handleGenerate.mutate()}
                    >
                        Wygeneruj koszty za {formatMonthLabel(dateSelected)}
                    </Button>
                    <Button variant="secondary" icon={<IconPlus size={15}/>} onClick={() => setIsAddDialogVisible(true)}>
                        Dodaj koszt
                    </Button>
                </>
            }
        >
            <MonthSettlementSummary items={expenses ?? []} settledLabel="Zapłacono" outstandingLabel="Do zapłaty"/>

            <DataTableCard value={expenses} columns={columns} rowActions={rowActions} loading={isLoading} emptyMessage="Brak kosztów w tym miesiącu"/>

            {selectedExpense && isDetailsDialogVisible && <ExpenseDetailsDialog expense={selectedExpense} onHide={closeDialogs}/>}
            {selectedExpense && isEditDialogVisible && (
                <EditExpenseDialog
                    expense={selectedExpense}
                    saving={updateAction.isPending}
                    onSave={(dto: UpdateOperationalExpenseDTO) => updateAction.mutate(dto, {onSuccess: closeDialogs})}
                    onHide={closeDialogs}
                />
            )}
            {isAddDialogVisible && (
                <AddExpenseDialog
                    defaultDate={defaultDueDate(dateSelected)}
                    apartments={apartments}
                    saving={addAction.isPending}
                    onSave={(dto: NewOperationalExpenseDTO) => addAction.mutate(dto, {onSuccess: () => setIsAddDialogVisible(false)})}
                    onHide={() => setIsAddDialogVisible(false)}
                />
            )}
            {selectedExpense && isConfirmDialogVisible && (
                <ConfirmExpenseDialog expense={selectedExpense} onConfirm={handleConfirmExpense} onHide={closeDialogs}/>
            )}
        </Page>
    );
};

export default ExpensePaymentsPage;
