import {ProgressSpinner} from 'primereact/progressspinner';
import {Button} from "primereact/button";
import {useModal} from "../../../hooks/use-modal";
import {ExpensesTable} from "../expenses-template-view-table/expenses-template-view.table.tsx";
import {AddEditExpensesTemplateDialog} from "../add-edit-expenses-template/add-edit-expenses-template-dialog.tsx";
import {getExpensesTemplate} from "../api/expenses-template.api.ts";
import {useState} from "react";
import {OperationalExpenseTemplateResponse} from "../../../api/generated";
import {ViewMode} from "../../../commons/view-mode.ts";

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


    const handleOpenCreate = () => {
        setMode(ViewMode.CREATE)
        setExpensesModalOpen(true)
    }

    const handleOpenEdit = () => {
        setMode(ViewMode.UPDATE)
        setExpensesModalOpen(true)
    }

    const handleClose = () => {
        setExpensesModalOpen(false)
        setSelectedExpense(null)
        setMode(null)
    }


    const handleSelectExpense = (selectedExpense: OperationalExpenseTemplateResponse) => {
        setSelectedExpense(selectedExpense)
        handleOpenEdit()
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
                            handleOnExpenseEdit={handleSelectExpense}
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
        </>
    );
}
