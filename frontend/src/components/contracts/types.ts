export interface Contract {
    id: number
    personId?: number
    roomId?: number
    startDate?: string
    endDate?: string
    amount?: number
}

export interface NewContract {
    personId?: number
    roomId?: number
    startDate?: string
    endDate?: string
    amount?: number
}