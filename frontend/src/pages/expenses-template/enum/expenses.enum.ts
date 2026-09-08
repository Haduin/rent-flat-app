// Mapper do polskich tłumaczeń
import {ExpenseCategory} from "../../../api/generated";

const expenseCategoryLabels: Record<ExpenseCategory, string> = {
    [ExpenseCategory.OwnerRent]: 'Czynsz właściciela',
    [ExpenseCategory.UtilityWaterCold]: 'Woda zimna',
    [ExpenseCategory.UtilityWaterHot]: 'Woda ciepła',
    [ExpenseCategory.UtilityElectricity]: 'Prąd',
    [ExpenseCategory.UtilityGas]: 'Gaz',
    [ExpenseCategory.TaxZus]: 'ZUS',
    [ExpenseCategory.TaxPit]: 'PIT',
    [ExpenseCategory.Other]: 'Inne',
};

export const getExpenseCategoryLabel = (category: ExpenseCategory | string): string => {
    if (typeof category === 'string') {
        const enumValue = category as ExpenseCategory;
        return expenseCategoryLabels[enumValue] || category;
    }
    return expenseCategoryLabels[category] || category;
};

export const expenseOptions = [
    {label: 'Generalne', value: 'general'},
    {label: 'Mieszkanie', value: 'property'},
    {label: 'Pokój', value: 'room'}
];