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