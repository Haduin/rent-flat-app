import {useState} from "react";
import {getExpensesTemplate, removeExpensesTemplate} from "../../../src/pages/expenses-template/api/expenses-template.api.ts";
import {ExpenseTemplateDialog} from "./ExpenseTemplateDialog.tsx";
import {confirmDanger} from "../../components/ui/confirm.ts";
import {useModal} from "../../../src/hooks/use-modal";
import {ViewMode} from "../../../src/commons/view-mode.ts";
import {getExpenseCategoryLabel} from "../../../src/pages/expenses-template/enum/expenses.enum.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {Page} from "../../components/layout/Page.tsx";
import {DataTableCard, DataTableColumn} from "../../components/ui/DataTableCard.tsx";
import {Button} from "../../components/ui/Button.tsx";
import {Badge} from "../../components/ui/Badge.tsx";
import {EXPENSE_CATEGORY_TONE} from "../../components/ui/expense-category.ts";
import {IconPlus} from "../../components/ui/icons.tsx";
import {OperationalExpenseTemplateResponse} from "../../../src/api/generated";

const ExpenseTemplatesPage = () => {
    const [selectedExpense, setSelectedExpense] = useState<OperationalExpenseTemplateResponse | null>(null);
    const [mode, setMode] = useState<ViewMode | null>(null);

    const {data: expensesTemplates = [], isLoading} = getExpensesTemplate();
    const removeAction = removeExpensesTemplate();

    const {isOpen: isExpensesModalOpen, setOpen: setExpensesModalOpen} = useModal();

    const handleOpenCreate = () => {
        setMode(ViewMode.CREATE);
        setExpensesModalOpen(true);
    };
    const handleOpenEdit = () => {
        setMode(ViewMode.UPDATE);
        setExpensesModalOpen(true);
    };
    const handleClose = () => {
        setExpensesModalOpen(false);
        setSelectedExpense(null);
        setMode(null);
    };
    const handleSelectEditExpense = (expense: OperationalExpenseTemplateResponse) => {
        setSelectedExpense(expense);
        handleOpenEdit();
    };
    // The backend keeps a removed template (its generated costs point at it) and only deactivates it.
    const handleDeactivate = (expense: OperationalExpenseTemplateResponse) =>
        confirmDanger({
            title: `Wyłączyć szablon ${getSelectedExpenseLabel(expense)}?`,
            message: "Od następnego generowania nie będzie tworzył nowych kosztów. Koszty już wygenerowane zostają. Wyłączenia nie da się na razie cofnąć.",
            confirmLabel: "Wyłącz szablon",
            onConfirm: () => removeAction.mutate(expense.id),
        });
    const getSelectedExpenseLabel = (expense: OperationalExpenseTemplateResponse | null) => {
        if (!expense) return "";
        const target = expense.room?.name ?? expense.apartment?.name ?? "ogólny";
        return `${getExpenseCategoryLabel(expense.category)} (${target}) - ${expense.amount.toFixed(2)} zł`;
    };

    const categoryBody = (row: OperationalExpenseTemplateResponse) => (
        <Badge tone={EXPENSE_CATEGORY_TONE[row.category]}>{getExpenseCategoryLabel(row.category)}</Badge>
    );

    const statusBody = (row: OperationalExpenseTemplateResponse) => (
        <Badge tone={row.active ? "success" : "neutral"}>{row.active ? "Aktywny" : "Nieaktywny"}</Badge>
    );

    // a deactivated template is frozen: the backend rejects edits with EXPENSE_TEMPLATE_INACTIVE
    const rowActions = (row: OperationalExpenseTemplateResponse) => row.active && (
        <>
            <Button variant="secondary" size="small" icon="pi pi-pencil" aria-label="Edytuj szablon" onClick={() => handleSelectEditExpense(row)}/>
            <Button variant="danger-outline" size="small" icon="pi pi-ban" aria-label="Wyłącz szablon" onClick={() => handleDeactivate(row)}/>
        </>
    );

    const columns: DataTableColumn<OperationalExpenseTemplateResponse>[] = [
        {header: "Mieszkanie", body: (row) => row.apartment?.name ?? "-", sortable: true, field: "apartment.name"},
        {header: "Pokój", body: (row) => row.room?.name ?? "-", sortable: true, field: "room.name"},
        {header: "Kategoria", body: categoryBody, sortable: true, field: "category"},
        {header: "Kwota", body: (row) => formatCurrency(row.amount), sortable: true, field: "amount"},
        {header: "Dzień płatności", body: (row) => `${row.dayOfMonth}. dnia`, sortable: true, field: "dayOfMonth"},
        {header: "Status", body: statusBody, sortable: true, field: "active"},
    ];

    return (
        <Page
            title="Szablony kosztów"
            subtitle="Co miesiąc tworzą koszty operacyjne w wybranym dniu"
            actions={
                <Button variant="primary" icon={<IconPlus size={15}/>} onClick={handleOpenCreate}>
                    Dodaj szablon
                </Button>
            }
        >
            <DataTableCard
                value={expensesTemplates}
                columns={columns}
                rowActions={rowActions}
                loading={isLoading}
                emptyMessage="Brak szablonów kosztów"
            />

            {isExpensesModalOpen && (
                <ExpenseTemplateDialog template={ViewMode.UPDATE === mode ? selectedExpense : null} onHide={handleClose}/>
            )}
        </Page>
    );
};

export default ExpenseTemplatesPage;
