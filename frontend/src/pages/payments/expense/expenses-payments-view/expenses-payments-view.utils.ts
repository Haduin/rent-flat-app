import {ExpenseCategory, OperationalExpenseDTO, PaymentStatus} from "../../../../api/generated";

export const EXPENSE_STATUS_LABEL: Record<PaymentStatus, string> = {
    [PaymentStatus.Pending]: "Oczekuje",
    [PaymentStatus.Paid]: "Opłacony",
    [PaymentStatus.Late]: "Zaległy",
    [PaymentStatus.Cancelled]: "Anulowany",
    [PaymentStatus.PartiallyPaid]: "Częściowo opłacony",
};

export const expenseStatusSeverity = (status: OperationalExpenseDTO["status"]) => {
    switch (status) {
        case PaymentStatus.Paid:
            return "success";
        case PaymentStatus.Late:
            return "danger";
        case PaymentStatus.PartiallyPaid:
            return "warning";
        case PaymentStatus.Cancelled:
            return "secondary";
        case PaymentStatus.Pending:
        default:
            return "info";
    }
};

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