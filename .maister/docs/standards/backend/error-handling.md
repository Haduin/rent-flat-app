# Error Handling (backend + kontrakt dla frontendu)

Obowiązujący standard obsługi błędów i odpowiedzi w Ktor. Realizuje `standards/global/error-handling.md`
(*Typed Exceptions*, *Centralized Handling*, *Fail Fast*, *Clear User Messages*).

Kod: `backend/src/main/kotlin/pl/chodan/error/` (`ApiError.kt`, `ApiException.kt`, `ErrorHandling.kt`,
`DeclaredErrors.kt`, `CallParameters.kt`, `RequestValidation.kt`).

---

## 1. Warstwy

```
Routing     – odczyt parametrów (helpery z CallParameters), receive<DTO>(), wywołanie serwisu, respond(sukces)
Service     – pre-checki domenowe, rzuca <Feature>Error / ValidationException wewnątrz dbQuery
StatusPages – jedyne miejsce mapujące wyjątek → (status, ApiError); instalowane raz w configureErrorHandling
```

- **W routingu nie ma `try/catch`.** Jeśli handler potrzebuje `try`, brakuje typu wyjątku albo mapowania w `StatusPages`.
- Wyjątek rzucony w `dbQuery` wycofuje transakcję; w serwisie też nie łapiemy go, żeby zamienić na wynik.
- Nie mapujemy globalnie `IllegalArgumentException`/`IllegalStateException` na 4xx (rzucają je też biblioteki,
  a wewnętrzny komunikat wyciekłby do klienta). `require`/`check` nie służą do błędów biznesowych.

## 2. Kontrakt odpowiedzi błędu

Każda odpowiedź ≥ 400 ma body `ApiError`. `ErrorCode` niesie swój status HTTP.

```kotlin
@Serializable
enum class ErrorCode(val status: HttpStatusCode) {
    VALIDATION_FAILED(HttpStatusCode.BadRequest),
    INVALID_PAYLOAD(HttpStatusCode.BadRequest),
    UNAUTHORIZED(HttpStatusCode.Unauthorized),
    INTERNAL_ERROR(HttpStatusCode.InternalServerError),
    CONTRACT_NOT_FOUND(HttpStatusCode.NotFound),
    CONTRACT_TERMINATED(HttpStatusCode.Conflict),
    // ... pozostałe kody domenowe <FEATURE>_<SYTUACJA>
}

@Serializable
data class ApiError(val code: ErrorCode, val message: String, val details: List<String> = emptyList())
```

- `message` jest po polsku i gotowy do pokazania użytkownikowi; dla 500 zawsze „Wystąpił nieoczekiwany błąd”
  (szczegóły tylko w logu).
- `details` dla błędów walidacji ma format `"<pole>: <komunikat>"`.

Kody ogólne (`GENERIC_ERROR_CODES` w `ErrorHandling.kt`) są zawsze dozwolone:

| Kod | Status | Źródło |
|---|---|---|
| `VALIDATION_FAILED` | 400 | `ValidationException` (helpery parametrów, walidacja ad hoc), `RequestValidationException` |
| `INVALID_PAYLOAD` | 400 | `BadRequestException`, `JsonConvertException` (body nie parsuje się do DTO), `status(415)` (zły `Content-Type`: Ktor odpowiada 415 przed `StatusPages`, mapujemy na 400) |
| `UNAUTHORIZED` | 401 | challenge JWT w `Module.kt` |
| `INTERNAL_ERROR` | 500 | `Throwable` |

Nowy kod domenowy dodajemy do `ErrorCode`, gdy pojawia się nowa sytuacja, na którą klient może zareagować.

## 3. Wyjątki

```kotlin
abstract class ApiException(val code: ErrorCode, message: String, val details: List<String> = emptyList()) :
    RuntimeException(message)

class ValidationException(message: String, details: List<String> = emptyList()) :
    ApiException(ErrorCode.VALIDATION_FAILED, message, details)
```

Każdy moduł ma własną sealed klasę w `model/<feature>/service/<Feature>Error.kt`; podklasa ustawia kod i komunikat:

```kotlin
sealed class ContractError(code: ErrorCode, message: String) : ApiException(code, message) {
    class NotFound(id: Int) : ContractError(ErrorCode.CONTRACT_NOT_FOUND, "Nie znaleziono kontraktu o id $id")
    class Terminated : ContractError(ErrorCode.CONTRACT_TERMINATED, "Kontrakt jest już zakończony")
}
```

- Podklasa przyjmuje tylko argumenty, których używa jej komunikat (`Terminated`, `RoomInUse` są bezargumentowe).
- Serwis może rzucać błędy innych modułów (np. `ContractService` rzuca `PersonError.NotFound` przez `lockPerson`).
- `ValidationException` tylko dla ad hoc 400 (parametry, reguły spoza DTO). Walidacja body idzie przez `RequestValidation`.

## 4. Deklaracja błędów endpointu: `errors(...)`

```kotlin
put({
    operationId = "updateContract"
    errors(
        ErrorCode.VALIDATION_FAILED, ErrorCode.INVALID_PAYLOAD,
        ErrorCode.CONTRACT_NOT_FOUND, ErrorCode.ROOM_NOT_FOUND, ErrorCode.CONTRACT_TERMINATED
    )
    request { body<UpdateContractDetails>() }
    response { code(HttpStatusCode.NoContent) { description = "Contract updated" } }
}) {
    contractService.updateContract(call.receive<UpdateContractDetails>())
    call.respond(HttpStatusCode.NoContent)
}
```

- **Jedno `errors(...)` na endpoint, tylko na trasie-liściu** (metodzie HTTP). Deklaracje z `route(...)` nie są dziedziczone.
- `errors(...)` grupuje kody po statusie i tworzy jeden wpis OpenAPI na status (`description` = nazwy kodów,
  body `ApiError`). Nie piszemy ręcznie `code(4xx) { body<ApiError>() }`.
- `VALIDATION_FAILED`/`INVALID_PAYLOAD` deklarujemy tylko po to, żeby 400 było w OpenAPI (endpoint z parametrem
  lub body). `INTERNAL_ERROR` i `UNAUTHORIZED` nie deklarujemy.
- **Deklaracja jest obowiązkowa** (sprawdzana w code review): dodając `throw` w serwisie, dopisz kod do `errors(...)`
  każdego endpointu, który woła tę metodę, inaczej brakuje go w OpenAPI.
- **Runtime**: `ApiException` z kodem domenowym, którego endpoint nie zadeklarował, daje log `WARN`
  („Niezadeklarowany kod błędu <KOD> dla <METODA> <uri>”) i normalną odpowiedź (`code.status` + `ApiError`).
  Kody ogólne nie dają ostrzeżenia.
- **401 globalnie**: `configureOpenAPI` ustawia `security { defaultUnauthorizedResponse { body<ApiError>() } }`,
  więc 401 trafia na wszystkie trasy pod `authenticate {}`.

## 5. Reguła sukcesu

| Operacja | Odpowiedź |
|---|---|
| `GET` | 200 + body |
| `POST` tworzący zasób | 201 + `IdResponse(id)` (`pl.chodan.routing.IdResponse`) albo utworzony obiekt |
| `PUT`, `DELETE`, akcje (np. confirm, split) | 204 bez body |

Bez stringów i `mapOf("message" to ...)` w odpowiedziach sukcesu.

## 6. Walidacja wejścia

- Body: `RequestValidation` z walidatorem per DTO w `model/<feature>/dto/<Feature>Validation.kt`
  (`fun RequestValidationConfig.<feature>Validation()`), rejestrowanym w `configureErrorHandling { ... }`.
  Zbieramy wszystkie błędy i zwracamy `errors.toValidationResult()`.
- **Pusty PUT** (wszystkie pola opcjonalne `null`) odrzuca walidator DTO: „Podaj co najmniej jedno pole do zmiany”
  (400 `VALIDATION_FAILED`).
- Parametry ścieżki/query tylko przez helpery z `CallParameters.kt`: `intParam`, `optionalIntQuery`,
  `yearMonthQuery`, `optionalEnumQuery`, `isoDateQuery`. Bez ręcznego `toIntOrNull()` w routingu.

```kotlin
validate<UpdateContractDetails> { dto ->
    buildList {
        if (listOf(dto.roomId, dto.amount, dto.endDate /* ... */).all { null == it }) add("Podaj co najmniej jedno pole do zmiany")
        dto.amount?.let { if (it <= 0) add("amount: kwota musi być większa od 0") }
    }.toValidationResult()
}
```

## 7. Pre-checki domenowe i blokady

Błąd domenowy wykrywamy pre-checkiem w tym samym `dbQuery`, a nie przez naruszenie FK/unique (to dałoby 500).
Pre-check musi trzymać blokadę, żeby wynik nie zmienił się przed zapisem (TOCTOU):

- **Rodzic sprawdzany tylko pod kątem istnienia**: `forUpdate(ForUpdateOption.PostgreSQL.ForKeyShare)`.
  Blokuje tylko jego `DELETE`/`FOR UPDATE`, nie koliduje z FK ani z innymi pre-checkami (helpery `lockPerson`, `lockRoom`).
- **Wiersz usuwany albo zmieniający stan**: `forUpdate()` (`FOR UPDATE`).
- **Kilka wierszy naraz**: zawsze `orderBy(id)` przed `forUpdate()`.
- **Kolejność blokad**: najpierw wiersz zmieniany (`FOR UPDATE`), potem rodzice w kolejności osoba → pokój → szablon
  (np. `updateExpense`: koszt → szablon; `updateExpenseTemplate`: szablon → pokój, bo szablon jest wierszem
  zmienianym; `createContract`: osoba → pokój).
- Rodzica, którego nikt twardo nie usuwa (mieszkanie), tylko sprawdzamy (`requireApartment`), bez blokady.

```kotlin
internal fun lockRoom(id: Int) {
    val exists = Room.selectAll().where { Room.id eq id }.forUpdate(ForUpdateOption.PostgreSQL.ForKeyShare).any()
    if (!exists) throw ApartmentError.RoomNotFound(id)
}
```

## 8. Frontend

- Klient OpenAPI jest generowany do `frontend/src/api/generated` i **nigdy nie jest edytowany ręcznie**.
  Regeneracja: `pnpm generate-api` przy uruchomionym backendzie (czyta `http://localhost:8080/openapi.json`).
- Błąd odczytujemy helperem `frontend/src/utils/api-error.ts`: `apiErrorMessage(error)` (tekst do toasta,
  dla `VALIDATION_FAILED` z `details`) albo `readApiError(error)` (pełne `ApiErrorBody`). Helper nie importuje
  `generated`; rozpoznaje `ResponseError` po `response instanceof Response`.

```ts
onError: async (error) => showToast('error', 'Nie udało się zapisać umowy', await apiErrorMessage(error))
```

## 9. Testy

- Testy integracyjne serwisów: `assertApiError("CONTRACT_NOT_FOUND") { service.updateContract(...) }`
  (`src/integrationTest/.../testutil/ApiErrorAssertions.kt`).
- Testy routingu: `installTestErrorHandling()` (ten sam `configureErrorHandling` co produkcja) i jeden test
  tabelaryczny na moduł: dla każdej pary endpoint → kod z `errors(...)` mock serwisu rzuca `<Feature>Error`,
  a test sprawdza status i `ApiError.code`.
