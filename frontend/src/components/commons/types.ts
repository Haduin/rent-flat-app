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

export interface Contract {
    id: number
    person?: Person
    room?: Room
    startDate?: string
    endDate?: string
    amount?: number
    deposit?: number
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
}

export const statusMap: Record<Status, string> = {
    [Status.PENDING]: 'Oczekujące',
    [Status.PAID]: 'Zapłacono',
    [Status.LATE]: 'Spóźnione',
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

export interface PaymentConfirmationDTO {
    paymentId: number,
    paymentDate: string,
    payedAmount: number,
}

export interface UtilityDTO {

}


export const getStatusLabel = (status: Status): string => {
    return statusMap[status] || 'Nieznany';
};