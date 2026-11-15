package pl.chodan.model.contract.service

import pl.chodan.error.ApiException
import pl.chodan.error.ErrorCode

sealed class ContractError(code: ErrorCode, message: String) : ApiException(code, message) {
    class NotFound(id: Int) : ContractError(ErrorCode.CONTRACT_NOT_FOUND, "Nie znaleziono kontraktu o id $id")
    class Terminated : ContractError(ErrorCode.CONTRACT_TERMINATED, "Kontrakt jest już zakończony")
}
