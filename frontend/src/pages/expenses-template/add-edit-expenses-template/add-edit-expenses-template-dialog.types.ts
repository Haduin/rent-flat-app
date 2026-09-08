import {ExpenseCategory} from "../../../api/generated";

export type ExpenseScope = 'general' | 'property' | 'room';

export const expensesMap: Record<ExpenseCategory, string> = {
    [ExpenseCategory.OwnerRent]: 'Czynsz do właściciela',
    [ExpenseCategory.UtilityWaterCold]: 'Woda zimna',
    [ExpenseCategory.UtilityWaterHot]: 'Woda ciepła',
    [ExpenseCategory.UtilityElectricity]: 'Prąd',
    [ExpenseCategory.UtilityGas]: 'Gaz',
    [ExpenseCategory.TaxZus]: 'ZUS',
    [ExpenseCategory.TaxPit]: 'PIT',
    [ExpenseCategory.Other]: 'Inne',
};


// export const getExpenseCategoryLabel = (category: ExpenseCategory): string => {
//     return expensesMap[category] || 'Nieznana kategoria';
// };