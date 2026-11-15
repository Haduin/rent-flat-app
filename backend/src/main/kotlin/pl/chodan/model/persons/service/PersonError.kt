package pl.chodan.model.persons.service

import pl.chodan.error.ApiException
import pl.chodan.error.ErrorCode

sealed class PersonError(code: ErrorCode, message: String) : ApiException(code, message) {
    class NotFound(id: Int) : PersonError(ErrorCode.PERSON_NOT_FOUND, "Nie znaleziono osoby o id $id")
    class InUse : PersonError(ErrorCode.PERSON_IN_USE, "Osoba ma powiązane umowy i nie można jej usunąć")
}
