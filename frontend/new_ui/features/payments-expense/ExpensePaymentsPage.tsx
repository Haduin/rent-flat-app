import {useState} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Calendar} from "primereact/calendar";
import {Tag} from "primereact/tag";
import {
    useExpensesBySelectedMonth,
    useGenerateExpensesFromTemplates,
    useRemoveExpense,
    useUpdateExpense,
} from "../../../src/pages/payments/expense/api/expenses-payments-view.api.ts";
import {categorySeverity} from "../../../src/pages/payments/expense/expenses-payments-view/expenses-payments-view.utils.ts";
import {expensesMap} from "../../../src/pages/expenses-template/add-edit-expenses-template/add-edit-expenses-template-dialog.types.ts";
import {ExpenseDetailsDialog} from "../../../src/pages/payments/expense/expense-details-dialog/expense-details-dialog.tsx";
import {EditExpenseDialog} from "../../../src/pages/payments/expense/edit-expense-dialog/edit-expense-dialog.tsx";
import {ConfirmationDialog} from "../../../src/components/confirmation-dialog/confirmation-dialog.tsx";
import {useModal} from "../../../src/hooks/use-modal";
import {dateToStringWithYearMonth} from "../../../src/components/commons/dateFormatter.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {PageHeader} from "../../components/ui/PageHeader.tsx";
import {Card} from "../../components/ui/Card.tsx";
import {Button} from "../../components/ui/Button.tsx";
import {OperationalExpenseDTO, UpdateOperationalExpenseDTO} from "../../../src/api/generated";

const ExpensePaymentsPage = () => {
    const [dateSelected, setDateSelected] = useState<Date>();
    const [selectedExpense, setSelectedExpense] = useState<OperationalExpenseDTO | null>(null);

    const {expenses, isLoading} = useExpensesBySelectedMonth(dateSelected);
    const removeAction = useRemoveExpense();
    const updateAction = useUpdateExpense();
    const handleGenerate = useGenerateExpensesFromTemplates(dateSelected);

    const {isOpen: isDetailsDialogVisible, setOpen: setIsDetailsDialogVisible} = useModal();
    const {isOpen: isEditDialogVisible, setOpen: setIsEditDialogVisible} = useModal();
    const {isOpen: isDeleteDialogVisible, setOpen: setIsDeleteDialogVisible} = useModal();

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
        if (!expense) return "";
        const target = expense.roomDetails?.roomName ?? expense.apartmentDetails?.name ?? "ogólny";
        return `${target} - ${expense.amount.toFixed(2)} zł`;
    };

    const categoryBody = (row: OperationalExpenseDTO) => (
        <Tag severity={categorySeverity(row.category)} value={expensesMap[row.category] ?? row.category}/>
    );

    const actionsBody = (row: OperationalExpenseDTO) => (
        <div style={{display: "flex", gap: 6, justifyContent: "flex-end"}}>
            <Button variant="secondary" size="small" icon="pi pi-eye" onClick={() => handleView(row)}/>
            <Button variant="secondary" size="small" icon="pi pi-pencil" onClick={() => handleEdit(row)}/>
            <Button variant="danger-outline" size="small" icon="pi pi-trash" onClick={() => handleDelete(row)}/>
        </div>
    );

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

            <Card padding={0} style={{overflow: "hidden"}}>
                <DataTable
                    value={expenses}
                    loading={isLoading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    stripedRows
                    responsiveLayout="stack"
                    breakpoint="860px"
                    emptyMessage="Brak danych"
                >
                    <Column header="Mieszkanie" body={(row: OperationalExpenseDTO) => row.apartmentDetails?.name ?? "-"} sortable/>
                    <Column header="Pokój" body={(row: OperationalExpenseDTO) => row.roomDetails?.roomName ?? "-"} sortable/>
                    <Column header="Kategoria" body={categoryBody} sortable field="category"/>
                    <Column header="Kwota" body={(row: OperationalExpenseDTO) => formatCurrency(row.amount)} sortable field="amount"/>
                    <Column header="Termin płatności" body={(row: OperationalExpenseDTO) => row.costDate ?? "-"} sortable field="costDate"/>
                    <Column header="Data wpływu" body={(row: OperationalExpenseDTO) => row.insertDate ?? "-"} sortable field="insertDate"/>
                    <Column header="Nr faktury" body={(row: OperationalExpenseDTO) => row.invoiceNumber ?? "-"}/>
                    <Column header="Opis" body={(row: OperationalExpenseDTO) => row.description ?? "-"}/>
                    <Column header="" body={actionsBody} style={{width: 150}}/>
                </DataTable>
            </Card>

            <ExpenseDetailsDialog isVisible={isDetailsDialogVisible} onHide={closeDialogs} selectedExpense={selectedExpense}/>
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

export default ExpensePaymentsPage;
