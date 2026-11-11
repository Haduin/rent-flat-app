import {useState} from "react";
import {Tag} from "primereact/tag";
import {getExpensesTemplate, removeExpensesTemplate} from "../../../src/pages/expenses-template/api/expenses-template.api.ts";
import {AddEditExpensesTemplateDialog} from "../../../src/pages/expenses-template/add-edit-expenses-template/add-edit-expenses-template-dialog.tsx";
import {ConfirmationDialog} from "../../../src/components/confirmation-dialog/confirmation-dialog.tsx";
import {useModal} from "../../../src/hooks/use-modal";
import {ViewMode} from "../../../src/commons/view-mode.ts";
import {getExpenseCategoryLabel} from "../../../src/pages/expenses-template/enum/expenses.enum.ts";
import {categorySeverity} from "../../../src/pages/expenses-template/expenses-template-view-table/expenses-template-view.table.consts.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {PageHeader} from "../../components/ui/PageHeader.tsx";
import {DataTableCard, DataTableColumn} from "../../components/ui/DataTableCard.tsx";
import {Button} from "../../components/ui/Button.tsx";
import {Badge} from "../../components/ui/Badge.tsx";
import {IconPlus} from "../../components/ui/icons.tsx";
import {OperationalExpenseTemplateResponse} from "../../../src/api/generated";

const ExpenseTemplatesPage = () => {
    const [selectedExpense, setSelectedExpense] = useState<OperationalExpenseTemplateResponse | null>(null);
    const [mode, setMode] = useState<ViewMode | null>(null);

    const {data: expensesTemplates = [], isLoading} = getExpensesTemplate();
    const removeAction = removeExpensesTemplate();

    const {isOpen: isExpensesModalOpen, setOpen: setExpensesModalOpen} = useModal();
    const {isOpen: isExpensesDeleteModalOpen, setOpen: setExpensesDeleteModalOpen} = useModal();

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
        setExpensesDeleteModalOpen(false);
        setSelectedExpense(null);
        setMode(null);
    };
    const handleSelectEditExpense = (expense: OperationalExpenseTemplateResponse) => {
        setSelectedExpense(expense);
        handleOpenEdit();
    };
    const handleOnDelete = (expense: OperationalExpenseTemplateResponse) => {
        setSelectedExpense(expense);
        setExpensesDeleteModalOpen(true);
    };
    const getSelectedExpenseLabel = (expense: OperationalExpenseTemplateResponse | null) => {
        if (!expense) return "";
        const target = expense.room?.name ?? expense.apartment?.name ?? "ogólny";
        return `${getExpenseCategoryLabel(expense.category)} (${target}) - ${expense.amount.toFixed(2)} zł`;
    };

    const categoryBody = (row: OperationalExpenseTemplateResponse) => (
        <Tag severity={categorySeverity(row.category)} value={getExpenseCategoryLabel(row.category)}/>
    );

    const statusBody = (row: OperationalExpenseTemplateResponse) => (
        <Badge tone={row.active ? "success" : "danger"}>{row.active ? "Aktywny" : "Nieaktywny"}</Badge>
    );

    const rowActions = (row: OperationalExpenseTemplateResponse) => (
        <>
            <Button variant="secondary" size="small" icon="pi pi-pencil" onClick={() => handleSelectEditExpense(row)}/>
            <Button variant="danger-outline" size="small" icon="pi pi-trash" onClick={() => handleOnDelete(row)}/>
        </>
    );

    const columns: DataTableColumn<OperationalExpenseTemplateResponse>[] = [
        {header: "Mieszkanie", body: (row) => row.apartment?.name ?? "-", sortable: true, field: "apartment.name"},
        {header: "Pokój", body: (row) => row.room?.name ?? "-", sortable: true, field: "room.name"},
        {header: "Kategoria", body: categoryBody, sortable: true, field: "category"},
        {header: "Kwota", body: (row) => formatCurrency(row.amount), sortable: true, field: "amount"},
        {header: "Dzień płatności", body: (row) => `${row.dayOfMonth} dzień miesiąca`, sortable: true, field: "dayOfMonth"},
        {header: "Status", body: statusBody, sortable: true, field: "active"},
    ];

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 20}}>
            <PageHeader
                title="Szablony kosztów cyklicznych"
                subtitle="Generują koszty operacyjne automatycznie w wybranym dniu miesiąca"
                actions={
                    <Button variant="primary" icon={<IconPlus size={15}/>} onClick={handleOpenCreate}>
                        Dodaj szablon
                    </Button>
                }
            />

            <DataTableCard
                value={expensesTemplates}
                columns={columns}
                rowActions={rowActions}
                loading={isLoading}
                emptyMessage="Brak wydatków do wyświetlenia"
            />

            <AddEditExpensesTemplateDialog mode={mode} isVisible={isExpensesModalOpen} onHide={handleClose} selectedExpense={selectedExpense}/>
            <ConfirmationDialog
                title={`Czy na pewno chcesz usunąć szablon: ${getSelectedExpenseLabel(selectedExpense)}`}
                isOpen={isExpensesDeleteModalOpen}
                onClose={handleClose}
                onConfirm={() => {
                    if (selectedExpense) removeAction.mutate(selectedExpense.id, {onSuccess: handleClose});
                }}
                confirmLabel="Usuń"
                cancelLabel="Anuluj"
            />
        </div>
    );
};

export default ExpenseTemplatesPage;
