import {ExpenseCategory, OperationalExpenseDTO} from "../../../../api/generated";

export const categorySeverity = (category: OperationalExpenseDTO["category"]) => {
    switch (category) {
        case ExpenseCategory.OwnerRent:
        case "OWNER_RENT":
            return "success";
        case ExpenseCategory.UtilityElectricity:
            return "warning";
        case ExpenseCategory.UtilityWaterCold:
        case ExpenseCategory.UtilityWaterHot:
            return "info";
        case ExpenseCategory.UtilityGas:
            return "danger";
        case ExpenseCategory.TaxPit:
        case ExpenseCategory.TaxZus:
            return "secondary";
    }
};