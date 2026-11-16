package pl.chodan.model.apartment.service

import pl.chodan.error.ApiException
import pl.chodan.error.ErrorCode

sealed class ApartmentError(code: ErrorCode, message: String) : ApiException(code, message) {
    class NotFound(id: Int) : ApartmentError(ErrorCode.APARTMENT_NOT_FOUND, "Nie znaleziono mieszkania o id $id")
    class RoomNotFound(id: Int) : ApartmentError(ErrorCode.ROOM_NOT_FOUND, "Nie znaleziono pokoju o id $id")
    class RoomInUse : ApartmentError(ErrorCode.ROOM_IN_USE, "Pokój ma powiązane umowy lub koszty")
}
