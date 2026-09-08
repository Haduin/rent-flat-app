import {ExpenseCategory, OperationalExpenseTemplateResponse} from "../../../api/generated";

export const categorySeverity = (category: OperationalExpenseTemplateResponse["category"]) => {
    switch (category) {
        case ExpenseCategory.OwnerRent:
            return "success";
        case ExpenseCategory.UtilityElectricity:
            return "warning";
        case ExpenseCategory.UtilityWaterCold:
        case ExpenseCategory.UtilityWaterHot:
            return "info";
        case ExpenseCategory.UtilityGas:
            return "danger";
        case ExpenseCategory.TaxZus:
        case ExpenseCategory.TaxPit:
            return "secondary";
        default:
            return "contrast";
    }
};