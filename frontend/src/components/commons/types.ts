export interface Person {
    id: number;
    firstName: string;
    lastName: string;
    documentNumber: string;
    nationality?: string;
    status?: string;
}

export interface Room {
    id: number;
    number: number;
    apartment: string;
}

export interface ContractDto {
    id: number
    person?: Person
    room?: Room
    startDate?: string
    endDate?: string
    terminationDate?: string
    payedTillDayOfMonth: string
    payedDate?: string
    status: ContractStatus
    description?: string
    amount?: number
    deposit?: number
}

export interface DeleteContractDTO {
    contractId?: number,
    terminationDate?: string
    depositReturned?: boolean
    positiveCancel?: boolean
    description?: string
}

export interface NewContract {
    personId?: number
    roomId?: number
    startDate?: string
    endDate?: string
    amount?: number,
    deposit?: number,
    payedDate?: number
}

export interface PersonDto {
    id: number;
    firstName: string;
    lastName: string;
    documentNumber: string;
    nationality?: string;
    status?: string;
}

export enum Status {
    PENDING = 'PENDING',
    PAID = 'PAID',
    LATE = 'LATE',
    CANCELLED = 'CANCELLED',
}

export enum ContractStatus {
    ACTIVE = 'ACTIVE',
    TERMINATED = 'TERMINATED',
}

export const statusMap: Record<Status, string> = {
    [Status.PENDING]: 'Oczekujące',
    [Status.PAID]: 'Zapłacono',
    [Status.LATE]: 'Spóźnione',
    [Status.CANCELLED]: 'Anulowano',
};

export interface Payment {
    id: number,
    contractId: number,
    dueDate: string,
    payedDate: string,
    amount: number,
    person: Person,
    status: Status
    room: Room
}

export interface EditPayment {
    paymentId: number,
    amount?: number
    status: string,
    payedDate: string
}

export interface PaymentConfirmationDTO {
    paymentId: number,
    paymentDate: string,
    payedAmount: number,
}

export interface PaymentSummary {
    personId: number;
    firstName: string;
    lastName: string;
    totalPaid: number;
    totalPending: number;
    totalLate: number;
    totalCancelled: number;
    paymentCount: number;
}

export interface UpdateContractDetails {
    contractId: number;
    roomId?: number;
    amount?: number;
    deposit?: number;
    startDate?: string;
    endDate?: string;
    payedTillDayOfMonth?: string;
}


export const getStatusLabel = (status: Status): string => {
    return statusMap[status] || 'Nieznany';
};

// Operational expenses domain
export enum ExpenseCategory {
    OWNER_RENT = 'OWNER_RENT',
    UTILITY_WATER_COLD = 'UTILITY_WATER_COLD',
    UTILITY_WATER_HOT = 'UTILITY_WATER_HOT',
    UTILITY_ELECTRICITY = 'UTILITY_ELECTRICITY',
    UTILITY_GAS = 'UTILITY_GAS',
    TAX_ZUS = 'TAX_ZUS',
    TAX_PIT = 'TAX_PIT',
    OTHER = 'OTHER',
}

export interface OperationalExpense {
    id: number;
    apartmentId?: number | null;
    roomId?: number | null;
    insertDate: string; // yyyy-MM-dd
    costDate?: string | null; // yyyy-MM-dd
    amount: number;
    category: ExpenseCategory;
    description?: string | null;
    invoiceNumber?: string | null;
    templateId?: number | null;
}

export interface NewOperationalExpense {
    apartmentId?: number | null;
    roomId?: number | null;
    insertDate: string; // yyyy-MM-dd
    costDate?: string | null; // yyyy-MM-dd
    amount: number;
    category: ExpenseCategory;
    description?: string | null;
    invoiceNumber?: string | null;
    templateId?: number | null;
}

export interface UpdateOperationalExpense {
    id: number;
    apartmentId?: number | null;
    roomId?: number | null;
    insertDate?: string; // yyyy-MM-dd
    costDate?: string | null; // yyyy-MM-dd
    amount?: number;
    category?: ExpenseCategory;
    description?: string | null;
    invoiceNumber?: string | null;
}