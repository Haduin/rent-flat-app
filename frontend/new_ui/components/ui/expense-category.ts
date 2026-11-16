import { ExpenseCategory } from "../../../src/api/generated";
import { BadgeTone } from "./Badge.tsx";

export const EXPENSE_CATEGORY_TONE: Record<ExpenseCategory, BadgeTone> = {
  [ExpenseCategory.OwnerRent]: "success",
  [ExpenseCategory.UtilityElectricity]: "warning",
  [ExpenseCategory.UtilityWaterCold]: "warning",
  [ExpenseCategory.UtilityWaterHot]: "warning",
  [ExpenseCategory.UtilityGas]: "warning",
  [ExpenseCategory.TaxZus]: "neutral",
  [ExpenseCategory.TaxPit]: "neutral",
  [ExpenseCategory.Other]: "contrast",
};
