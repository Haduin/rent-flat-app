# Use case'y nowego UI (/protected/v2)

Spis tego, co użytkownik może zrobić na każdym ekranie, i czego oczekujemy po każdej akcji.
Plik służy do dwóch rzeczy:

1. **Potwierdzenie** – zaznacz `[x] OK` przy use case'ie, który opisuje rzeczywistość, albo dopisz poprawkę pod `Uwagi:`.
   Pytania otwarte (❓) wymagają decyzji biznesowej, zanim napiszemy test.
2. **Testy Playwright** – po potwierdzeniu każdy use case dostaje test; kolumna `Test` dostanie wynik (✅ / ❌ + link do błędu).

Oznaczenia: **[W]** walidacja formularza, **[D]** poprawność danych po zapisie, **[B]** znany błąd z audytu (numer z raportu).

---

## 0. Wspólne dla wszystkich ekranów

| ID | Akcja | Oczekiwany wynik | Potwierdzenie | Test |
|---|---|---|---|---|
| UC-0.1 | Wejście na dowolny `/protected/v2/*` bez sesji | Przekierowanie do Keycloak, po zalogowaniu powrót na ten sam adres | [ ] OK | |
| UC-0.2 | Wyloguj → „Tak” | Strona główna „Witaj w systemie mieszkań”; „Zaloguj się do systemu” pokazuje pusty formularz logowania | [ ] OK | |
| UC-0.3 | Wyloguj → „Nie” | Dialog się zamyka, sesja trwa | [ ] OK | |
| UC-0.4 | Zmiana miesiąca (chip miesiąca w nagłówku: ‹ › i kalendarz) na Wpłatach i Kosztach | Lista i podsumowanie przeładowują się dla wybranego miesiąca | [ ] OK | |
| UC-0.5 | Sortowanie po kliknięciu nagłówka kolumny | Rosnąco/malejąco; po edycji wiersza **wiersz zostaje na swoim miejscu** [B 4] | [ ] OK | |
| UC-0.6 | Paginacja (10 wierszy) | Przełączanie stron; po edycji/wyłączeniu wiersz nie „ucieka” na inną stronę [B 4] | [ ] OK | |
| UC-0.7 | Błąd backendu (np. 409/400) | Toast z komunikatem z backendu, formularz zostaje otwarty z wpisanymi danymi | [ ] OK | |
| UC-0.8 | Widok ≤1024px | Tabele jako karty, akcje w osobnym wierszu, brak przewijania w poziomie | [ ] OK | |

Uwagi:

---

## 1. Dashboard (`/protected/v2/dashboard`)

Tylko odczyt.

| ID | Akcja | Oczekiwany wynik | Potwierdzenie | Test |
|---|---|---|---|---|
| UC-1.1 | Wejście na dashboard | Kafelki: liczba mieszkań, pokoi, wynajętych; karta na każde mieszkanie (czynsz/mc, wynik netto) | [ ] OK | |
| UC-1.2 | [D] Wynik netto miesiąca | Wpłaty zebrane w tym miesiącu − koszty tego miesiąca | [ ] OK | |

❓ **Q1.** Czy koszty w wyniku netto mają liczyć się wszystkie (także nieopłacone), czy tylko opłacone? Dziś: wpłaty tylko opłacone, koszty wszystkie [B 7].

Uwagi:

---

## 2. Mieszkania (`/protected/v2/mieszkania`)

| ID | Akcja | Oczekiwany wynik | Potwierdzenie | Test |
|---|---|---|---|---|
| UC-2.1 | „Dodaj mieszkanie” → nazwa → Zapisz | Nowe mieszkanie na liście, toast sukcesu | [ ] OK | |
| UC-2.2 | [W] Pusta nazwa / same spacje | Błąd pod polem, brak zapisu | [ ] OK | |
| UC-2.3 | Wybór mieszkania z listy | Szczegóły: pokoje, kto mieszka w którym | [ ] OK | |
| UC-2.4 | Zmień nazwę mieszkania | Nowa nazwa widoczna wszędzie (umowy, koszty, dashboard) | [ ] OK | |
| UC-2.5 | Dodaj pokój | Pokój na liście mieszkania, dostępny w nowej umowie | [ ] OK | |
| UC-2.6 | Zmień nazwę pokoju | Nowa nazwa w umowach i kosztach | [ ] OK | |
| UC-2.7 | Usuń wolny pokój → potwierdź | Pokój znika | [ ] OK | |
| UC-2.8 | Pokój z najemcą | Brak przycisku „Usuń” | [ ] OK | |
| UC-2.9 | [D] Usuń pokój, który ma historię (zakończona umowa / koszt / szablon) | Błąd „pokój w użyciu”, pokój zostaje | [ ] OK | |

❓ **Q2.** Czy mieszkanie można usunąć? Dziś nie ma takiej akcji.

Uwagi:

---

## 3. Kontrakty (`/protected/v2/kontrakty`)

| ID | Akcja | Oczekiwany wynik | Potwierdzenie | Test |
|---|---|---|---|---|
| UC-3.1 | Filtr: Aktywne / Zakończone / Wszystkie | Lista pokazuje tylko wybrane | [ ] OK | |
| UC-3.2 | Wyszukiwanie (imię, nazwisko, mieszkanie, pokój) | Filtrowanie na bieżąco; brak wyników → „Żadna umowa nie pasuje…” | [ ] OK | |
| UC-3.3 | Kolejność domyślna | Najpierw po terminie / kończące się, potem po dacie końca | [ ] OK | |
| UC-3.4 | „Dodaj umowę”: najemca, pokój, daty, czynsz, kaucja, dzień płatności | Umowa aktywna; osoba dostaje status „Aktualny”; znika z listy wolnych osób | [ ] OK | |
| UC-3.5 | [W] Brak najemcy / pokoju / dat | Błąd pod każdym polem | [ ] OK | |
| UC-3.6 | [W] Koniec przed początkiem | „Koniec nie może być przed początkiem umowy” | [ ] OK | |
| UC-3.7 | [W] Czynsz ≤ 0, kaucja < 0 | Błąd pod polem | [ ] OK | |
| UC-3.8 | [W] Dzień płatności 0, 29, 31 | Błąd „Dzień od 1 do 28” | [ ] OK | |
| UC-3.9 | [D] Lista pokoi w nowej umowie | Tylko pokoje wolne w podanym okresie | [ ] OK | |
| UC-3.10 | Szczegóły (oko) | Wszystkie dane umowy, tylko odczyt | [ ] OK | |
| UC-3.11 | Edytuj (aktywna) | Zapis zmian, wpis w historii „zmieniona” | [ ] OK | |
| UC-3.12 | Edytuj / Zakończ przy zakończonej umowie | Przyciski wyłączone | [ ] OK | |
| UC-3.13 | [D] Edycja: zmiana pokoju na zajęty | Odrzucone – pokój zajęty [B 3] | [ ] OK | |
| UC-3.14 | Historia | Lista zmian od utworzenia, najstarsze pierwsze | [ ] OK | |
| UC-3.15 | Zakończ umowę: data, kaucja zwrócona, polubownie, notatka | Status „Zakończona”; osoba wraca do „Bez aktywnej umowy”; przyszłe oczekujące wpłaty anulowane | [ ] OK | |
| UC-3.16 | [W] Zakończ bez daty | Błąd pod polem | [ ] OK | |
| UC-3.17 | [D] Zakończ umowę z niezapłaconym czynszem za poprzedni miesiąc | Zaległa wpłata **zostaje** do zapłaty [B 1] | [ ] OK | |

❓ **Q3.** Najemca wprowadza się 15. dnia: czy czynsz za pierwszy miesiąc ma być pełny czy proporcjonalny? Dziś zawsze pełny.

Uwagi:

---

## 4. Osoby (`/protected/v2/osoby`)

| ID | Akcja | Oczekiwany wynik | Potwierdzenie | Test |
|---|---|---|---|---|
| UC-4.1 | „Dodaj osobę”: imię, nazwisko, numer dokumentu, narodowość | Osoba na liście, status „Bez aktywnej umowy” | [ ] OK | |
| UC-4.2 | [W] Puste imię / nazwisko, same spacje | Błąd pod polem | [ ] OK | |
| UC-4.3 | [W] Pole > 255 znaków | „Maksymalnie 255 znaków” | [ ] OK | |
| UC-4.4 | Edytuj osobę | Zmiany widoczne też w umowach i wpłatach; wiersz zostaje na miejscu [B 4] | [ ] OK | |
| UC-4.5 | Wyszukiwanie (imię+nazwisko, numer dokumentu) | Filtrowanie na bieżąco | [ ] OK | |
| UC-4.6 | „Tylko z aktywną umową” | Ukrywa osoby bez umowy | [ ] OK | |
| UC-4.7 | Usuń osobę | Przycisk zawsze wyłączony | [ ] OK | |

❓ **Q4.** Czy usuwanie osób ma wrócić (backend to obsługuje: odmawia, gdy osoba ma umowę), czy przycisk ma zniknąć?
❓ **Q5.** Czy numer dokumentu ma być unikalny?

Uwagi:

---

## 5. Wpłaty (`/protected/v2/platnosci/wplaty`)

| ID | Akcja | Oczekiwany wynik | Potwierdzenie | Test |
|---|---|---|---|---|
| UC-5.1 | „Wygeneruj płatności za <miesiąc>” | Jedna wpłata „Oczekuje” na każdą aktywną umowę w tym miesiącu; drugie kliknięcie nie tworzy duplikatów | [ ] OK | |
| UC-5.2 | Podsumowanie „Wpłacono X z Y · Do zebrania” | Liczy pełne wpłaty i raty częściowe | [ ] OK | |
| UC-5.3 | Kolejność | Zaległe, częściowe, oczekujące, potem opłacone i anulowane | [ ] OK | |
| UC-5.4 | Potwierdź (Oczekuje/Zaległe) → data, kwota | Status „Opłacone”, kwota = wpisana | [ ] OK | |
| UC-5.5 | [W] Potwierdź bez daty / kwota ≤ 0 | Błąd pod polem | [ ] OK | |
| UC-5.6 | Podziel → rata mniejsza niż reszta | Status „Częściowo”, rata w historii | [ ] OK | |
| UC-5.7 | Podziel → rata = reszta | Status „Opłacone” | [ ] OK | |
| UC-5.8 | [W] Rata > reszta | „Pozostało tylko X zł” | [ ] OK | |
| UC-5.9 | Wpłata „Częściowo” | Tylko „Podziel” (bez „Potwierdź”) | [ ] OK | |
| UC-5.10 | Edytuj (Opłacone/Anulowane): status, data, należność | Zapis zmian | [ ] OK | |
| UC-5.11 | [D] Edycja: „Częściowo” → „Opłacone” bez dopłaty | Odrzucone albo dopłata wymagana [B 2] | [ ] OK | |
| UC-5.12 | [D] Edycja: należność poniżej sumy rat | Odrzucone [B 2] | [ ] OK | |
| UC-5.13 | [D] Wpłata po terminie bez potwierdzenia | Status „Zaległe” [B 5] | [ ] OK | |

❓ **Q6.** Które przejścia statusów w edycji mają być dozwolone (np. Opłacone → Oczekuje, Anulowane → Oczekuje)?

Uwagi:

---

## 6. Koszty (`/protected/v2/platnosci/koszty`)

| ID | Akcja | Oczekiwany wynik | Potwierdzenie | Test |
|---|---|---|---|---|
| UC-6.1 | „Wygeneruj koszty za <miesiąc>” | Jeden koszt na każdy aktywny szablon; dzień 31 w lutym → ostatni dzień miesiąca; bez duplikatów | [ ] OK | |
| UC-6.2 | Kolory kategorii | Czynsz / media / podatki / inne rozróżnialne | [ ] OK | |
| UC-6.3 | Potwierdź zapłatę → data, kwota | Status „Opłacone” | [ ] OK | |
| UC-6.4 | [W] Bez daty / kwota ≤ 0 | Błąd pod polem | [ ] OK | |
| UC-6.5 | Szczegóły | Dane kosztu, tylko odczyt | [ ] OK | |
| UC-6.6 | Edytuj: kategoria, kwota, termin, nr faktury, opis | Zapis; wiersz zostaje na miejscu [B 4] | [ ] OK | |
| UC-6.7 | [W] Nr faktury > 255 znaków | Błąd pod polem | [ ] OK | |
| UC-6.8 | [D] Edycja: termin przeniesiony do miesiąca, w którym ten szablon ma już koszt | Błąd „już istnieje” | [ ] OK | |
| UC-6.9 | Usuń → potwierdź | Koszt znika | [ ] OK | |
| UC-6.10 | Dodaj jednorazowy koszt (np. naprawa) | **Brak akcji w nowym UI** [B 8] | [ ] OK | |

❓ **Q7.** Czy opłacony koszt można usuwać/edytować? Dziś tak, bez ograniczeń.
❓ **Q8.** Usunięty koszt z szablonu – „Wygeneruj” tworzy go znowu. Tak ma być?

Uwagi:

---

## 7. Szablony kosztów (`/protected/v2/szablony-kosztow`)

| ID | Akcja | Oczekiwany wynik | Potwierdzenie | Test |
|---|---|---|---|---|
| UC-7.1 | „Dodaj szablon”: kategoria, kwota, dzień, dotyczy (ogólny/mieszkanie/pokój) | Szablon „Aktywny” | [ ] OK | |
| UC-7.2 | [W] Brak kategorii, kwota ≤ 0, dzień poza 1–31 | Błąd pod polem | [ ] OK | |
| UC-7.3 | [W] „Mieszkanie” bez wyboru mieszkania; „Pokój” bez pokoju | Błąd pod polem | [ ] OK | |
| UC-7.4 | Edytuj aktywny | Zapis; wiersz zostaje na miejscu | [ ] OK | |
| UC-7.5 | Szablon nieaktywny | Brak przycisków; API odrzuca edycję (409) | [ ] OK | |
| UC-7.6 | Wyłącz → potwierdź | Status „Nieaktywny”, następne generowanie go pomija; ten sam wiersz nie pokazuje ponownie „Wyłącz” | [ ] OK | |
| UC-7.7 | Wyłącz → Anuluj | Nic się nie zmienia | [ ] OK | |

❓ **Q9.** Czy wyłączony szablon ma dać się włączyć ponownie?

Uwagi:
