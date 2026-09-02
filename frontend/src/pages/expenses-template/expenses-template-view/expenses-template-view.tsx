import {ProgressSpinner} from 'primereact/progressspinner';
import {Button} from "primereact/button";
import {useModal} from "../../../hooks/use-modal";
import {ExpensesTable} from "../expenses-template-view-table/expenses-template-view.table.tsx";
import {AddEditExpensesTemplateDialog} from "../add-edit-expenses-template/add-edit-expenses-template-dialog.tsx";
import {getExpensesTemplate} from "../api/expenses-template.api.ts";
import {useState} from "react";
import {OperationalExpenseTemplateResponse} from "../../../api/generated";
import {ViewMode} from "../../../commons/view-mode.ts";
import {ConfirmationDialog} from "../../../components/confirmation-dialog/confirmation-dialog.tsx";
import {getExpenseCategoryLabel} from "../enum/expenses.enum.ts";

export default function ExpensesTemplateView() {

    const [selectedExpense, setSelectedExpense] = useState<OperationalExpenseTemplateResponse | null>(null)

    const [mode, setMode] = useState<ViewMode | null>(null);

    const {
        data: expensesTemplates = [],
        isLoading: expensesTemplatesLoading
    } = getExpensesTemplate()

    const {
        isOpen: isExpensesModalOpen,
        setOpen: setExpensesModalOpen
    } = useModal()

    const {
        isOpen: isExpensesDeleteModalOpen,
        setOpen: setExpensesDeleteModalOpen
    } = useModal()


    const handleOpenCreate = () => {
        setMode(ViewMode.CREATE)
        setExpensesModalOpen(true)
    }

    const handleOpenEdit = () => {
        setMode(ViewMode.UPDATE)
        setExpensesModalOpen(true)
    }

    const handleRemoveAction = () => {

    }


    const handleClose = () => {
        setExpensesModalOpen(false)
        setExpensesDeleteModalOpen(false)
        setSelectedExpense(null)
        setMode(null)
    }


    const handleSelectEditExpense = (selectedExpense: OperationalExpenseTemplateResponse) => {
        setSelectedExpense(selectedExpense)
        handleOpenEdit()
    }

    const handleOnDelete = (selectedExpense: OperationalExpenseTemplateResponse) => {
        setSelectedExpense(selectedExpense)
        setExpensesDeleteModalOpen(true)
    }

    const getSelectedExpenseLabel = (expense: OperationalExpenseTemplateResponse | null) => {
        if (!expense) {
            return ''
        }
        const target = expense.room?.name ?? expense.apartment?.name ?? 'ogólny'
        return `${getExpenseCategoryLabel(expense.category)} (${target}) - ${expense.amount.toFixed(2)} zł`
    }

    return (
        <>
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-3">Wydatki operacyjne</h2>

                {/* Filters */}
                <div className="flex gap-2 items-end flex-wrap mb-4">
                    <div className="ml-auto flex items-end gap-2">
                        <Button
                            className="p-button-raised"
                            onClick={handleOpenCreate}
                            label="Dodaj wydatek"
                            icon="pi pi-plus"
                        />
                    </div>
                </div>

                {expensesTemplatesLoading ? (
                    <div className="flex justify-content-center">
                        <ProgressSpinner/>
                    </div>
                ) : (
                    <div className="p-2">
                        <ExpensesTable
                            items={expensesTemplates}
                            loading={expensesTemplatesLoading}
                            handleOnExpenseEdit={handleSelectEditExpense}
                            handleOnDelete={handleOnDelete}
                        />
                    </div>
                )}
            </div>
            <AddEditExpensesTemplateDialog
                mode={mode}
                isVisible={isExpensesModalOpen}
                onHide={handleClose}
                selectedExpense={selectedExpense}
            />
            <ConfirmationDialog
                title={`Czy na pewno chcesz usunąć szablon: ${getSelectedExpenseLabel(selectedExpense)}`}
                isOpen={isExpensesDeleteModalOpen}
                onClose={handleClose}
                onConfirm={handleRemoveAction}
                confirmLabel="Usuń"
                cancelLabel="Anuluj"
            />
        </>
    );
}
