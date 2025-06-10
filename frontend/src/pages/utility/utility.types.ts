export enum UtilityType {
    RENT = "RENT",
    RENT_FEES = "RENT_FEES",
    WATER_COLD = "WATER_COLD",
    WATER_HOT = "WATER_HOT",
    ELECTRICITY = "ELECTRICITY",
    GAS = "GAS"
}

export interface UtilityCost {
    id: number;
    apartmentId: number | null;
    type: UtilityType;
    amount: number;
}

export interface AddUtilityCost {
    apartmentId: number;
    type: UtilityType;
    amount: number;
    insertDate: string;
}
