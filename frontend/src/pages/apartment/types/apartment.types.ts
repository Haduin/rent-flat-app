export interface ApartmentWithRoomsNumber {
    apartmentName: string;
    roomName: string;
}

export interface RoomDetails {
    roomId: number;
    roomName: string;
    apartmentId: number;
}

export interface ApartmentWithRooms {
    apartmentId: number;
    apartmentName: string;
    rooms: RoomDetails[];
}
