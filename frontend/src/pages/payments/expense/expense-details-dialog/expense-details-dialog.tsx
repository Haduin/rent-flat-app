import {Modal} from "../../../../components/modal/modal.tsx";
import {ExpenseDetailsDialogProps} from "./expense-details-dialog.props.ts";
import {expensesMap} from "../../../expenses-template/add-edit-expenses-template/add-edit-expenses-template-dialog.types.ts";

export const ExpenseDetailsDialog = ({isVisible, onHide, selectedExpense}: ExpenseDetailsDialogProps) => {

    if (!isVisible || !selectedExpense)
        return null;

    return (
        <Modal isOpen={isVisible}
               title="Szczegóły wydatku"
               onClose={onHide}
               content={
                   <div className="mt-2 border-t border-gray-200">
                       <dl className="divide-y divide-gray-200">
                           <div className="py-3 grid grid-cols-3">
                               <dt className="text-sm font-medium text-gray-500">ID</dt>
                               <dd className="text-sm text-gray-900 col-span-2">{selectedExpense.id}</dd>
                           </div>
                           <div className="py-3 grid grid-cols-3">
                               <dt className="text-sm font-medium text-gray-500">Mieszkanie</dt>
                               <dd className="text-sm text-gray-900 col-span-2">
                                   {selectedExpense.apartmentDetails?.name ?? 'Brak danych'}
                               </dd>
                           </div>
                           <div className="py-3 grid grid-cols-3">
                               <dt className="text-sm font-medium text-gray-500">Pokój</dt>
                               <dd className="text-sm text-gray-900 col-span-2">
                                   {selectedExpense.roomDetails?.roomName ?? 'Brak danych'}
                               </dd>
                           </div>
                           <div className="py-3 grid grid-cols-3">
                               <dt className="text-sm font-medium text-gray-500">Kategoria</dt>
                               <dd className="text-sm text-gray-900 col-span-2">
                                   {expensesMap[selectedExpense.category] ?? selectedExpense.category}
                               </dd>
                           </div>
                           <div className="py-3 grid grid-cols-3">
                               <dt className="text-sm font-medium text-gray-500">Kwota</dt>
                               <dd className="text-sm text-gray-900 col-span-2">{selectedExpense.amount.toFixed(2)} zł</dd>
                           </div>
                           <div className="py-3 grid grid-cols-3">
                               <dt className="text-sm font-medium text-gray-500">Termin płatności</dt>
                               <dd className="text-sm text-gray-900 col-span-2">
                                   {selectedExpense.costDate ?? 'Brak danych'}
                               </dd>
                           </div>
                           <div className="py-3 grid grid-cols-3">
                               <dt className="text-sm font-medium text-gray-500">Data wpływu</dt>
                               <dd className="text-sm text-gray-900 col-span-2">{selectedExpense.insertDate}</dd>
                           </div>
                           <div className="py-3 grid grid-cols-3">
                               <dt className="text-sm font-medium text-gray-500">Numer faktury</dt>
                               <dd className="text-sm text-gray-900 col-span-2">
                                   {selectedExpense.invoiceNumber ?? 'Brak danych'}
                               </dd>
                           </div>
                           <div className="py-3 grid grid-cols-3">
                               <dt className="text-sm font-medium text-gray-500">Opis</dt>
                               <dd className="text-sm text-gray-900 col-span-2">
                                   {selectedExpense.description ?? 'Brak danych'}
                               </dd>
                           </div>
                       </dl>
                   </div>
               }
        />
    );
};
