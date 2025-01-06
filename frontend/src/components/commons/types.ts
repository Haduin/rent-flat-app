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
}

export interface NewContract {
    personId?: number
    roomId?: number
    startDate?: string
    endDate?: string
    amount?: number,
    deposit?: number,
}

export interface PersonDto {
    id: number;
    firstName: string;
    lastName: string;
    documentNumber: string;
    nationality?: string;
    status?: string;
}