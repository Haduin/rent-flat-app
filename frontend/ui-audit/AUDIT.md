# Audyt UI — Mieszkania, nowy UI `new_ui` (2026-11-12)

Zakres: `frontend/new_ui` (trasy `/protected/v2/*`). Legacy `src/pages` jest oznaczony jako deprecated i pominięty.
Pełny skan: `ui-audit/scan.json`. Skaner nie parsuje `oklch()`, dlatego kolory policzono osobno (grep + własny przelicznik oklch → sRGB do kontrastu).

## Podsumowanie

Theme już istnieje (`new_ui/theme/tokens.css`, kierunek „A”, prefiks `--ku-*`) i paleta jest spójna: 33 unikalne wartości `oklch`, prawie wszystkie to tokeny. Główny problem jest techniczny. Tokeny są zdefiniowane na `.kwatera-a`, a komponenty PrimeReact renderowane w portalach (Dialog, Calendar, Dropdown, Toast) są poza tym kontenerem. Dlatego **71 nadpisań PrimeReact wkleja wartości tokenów jako surowe literały** — dwa źródła prawdy. Drugi problem to brak skal typografii i odstępów: **33 rozmiary fontu i 62 wartości odstępów**, w dużej części w 76 inline `style={{…}}` w 19 plikach. WCAG: jedno realne naruszenie (obramowanie pól formularza 1,35:1 przy wymaganym 3:1), `lang="en"`, brak `prefers-reduced-motion`.

## Stack i obecny theming

- React 19 + Vite, PrimeReact 10.9.7 (motyw lara) + primeflex/primeicons, Tailwind obecny w projekcie (używany głównie przez legacy).
- `new_ui` styluje się przez: (1) tokeny `--ku-*` + klasy `.ku-*` w `tokens.css`, (2) nadpisania PrimeReact pod `body[data-ku-theme='a']`, (3) inline `style={{}}` w TSX.
- Tokeny: kolory semantyczne (bg/surface/border/text×3/accent×4/success/warning/danger/ended/neutral + `-soft`), radius (8/12/16/pill), cień (sm/md), fonty (Sora / Public Sans). **Brak**: skali fontów, skali odstępów, z-index, czasów animacji, tokenów focus ring.
- Dark mode: brak (i nie był w briefie).

## Niespójności

### Kolory
- `tokens.css:100–420, 866–1035` — 71 literałów `oklch(...)` będących kopią tokenów, np. `oklch(55% 0.16 260)` ×17 (= `--ku-accent`), `oklch(46% 0.16 260)` ×8 (= `--ku-accent-hover`), `oklch(50% 0.01 260)` ×7 (= `--ku-text-secondary`), `oklch(90% 0.006 90)` ×6 (= `--ku-border-strong`). Przyczyna: tokeny na `.kwatera-a` nie sięgają portali.
- Wartości bez tokenu: `oklch(97% 0.02 260)` (hover ghost), `oklch(97% 0.004 90)` (hover secondary), `oklch(41% 0.16 25)` (hover danger), `oklch(91% 0.05 260)`, `oklch(95% 0.004 90)` / `oklch(72% 0.006 90)` (disabled), `oklch(98% 0.003 90)`.
- `components/ui/StatTile.tsx:17–22` — paleta „ciemnego kafla” (4 kolory) w TS zamiast tokenów.
- `components/layout/AppShell.tsx:88`, `StatTile.tsx:69` — `#ffffff` w TSX zamiast `--ku-accent-contrast`/`--ku-surface`.
- Cienie: `--ku-shadow-*` w `rgba(20,20,40,…)`, a `tokens.css:930` używa `oklch(22% 0.012 260 / 0.12)` — dwa zapisy tego samego.

### Typografia
- 33 unikalne rozmiary, m.in. `11px`, `11.5px`, `12px`, `12.5px`, `13px`, `13.5px`, `14px`, `16px`, `18px`, `26px` — w px, bez skali. Pół-pikselowe stopnie (12.5/13.5) różnią się od sąsiadów niezauważalnie.
- Inline: `PageHeader.tsx:12` (26px/700), `PageHeader.tsx:14`, `StatTile.tsx:43,75`, `ApartmentsPage.tsx:150,225`, `DashboardPage.tsx:120`.
- `font-family` zapisane na 3 sposoby (`tokens.css:98, 199, 249, 271, 333`), choć istnieją `--ku-font-body/display`.
- 13 wartości `font-weight` (w tym liczby inline).

### Odstępy i rozmiary
- 62 unikalne wartości; poza siatką 4px m.in. `6`, `10`, `14`, `18`, `2px`.
- Wrapper strony `display:flex; flexDirection:column; gap:20` powtórzony inline w każdej stronie (`ContractsPage`, `ExpensePaymentsPage`, `IncomePaymentsPage`, `ExpenseTemplatesPage`, `PersonsPage`, `ApartmentsPage`, `DashboardPage`).
- Padding kart: `20` / `18` / `0` / `14` przekazywane propem `padding` w różnych miejscach.

### Radiusy, cienie, z-index
- Radius: tokeny 8/12/16/999, ale w CSS literały `8px` ×3, `12px` ×3, `16px`, `10px` (`tokens.css:1180`, nowy `.ku-detail-list-compact`), `5` inline (`DashboardPage.tsx:29`).
- z-index: `20` ×2 (`tokens.css:422, 562`) — bez nazwanych warstw (na razie wystarcza).

### Komponenty (duplikaty i warianty)
- `features/apartments/NameDialog.tsx` — ręcznie złożony dialog formularza, duplikuje nowy `components/form/FormDialog` (szerokość, stopka, fokus).
- `components/ui/Card.tsx` z propami `padding`/`style`/`contentStyle` — strony przekazują różne paddingi zamiast wariantów.
- Legacy komponenty (`src/components/modal`, `text-field`, `select`, `date-selector`, `checkbox`) — nie są już używane przez `new_ui`; zostają tylko dla deprecated widoków.

### Stany interaktywne
- Focus: wspólny pierścień Ledger Blue jest, ale zdefiniowany 3× jako literał (`tokens.css:369, 1018, 1035`) — kandydat na token `--ku-focus-ring`.
- Disabled: spłaszczony do szarości (`tokens.css:154`) — OK (WCAG zwalnia nieaktywne kontrolki z kontrastu).
- Hover: wartości hover dla secondary/ghost/danger są literałami bez tokenów.

## Problemy WCAG

| Kryterium | Problem | Miejsca | Priorytet |
|---|---|---|---|
| 1.4.11 Kontrast elementów UI | Obramowanie pól (`input`, `dropdown`, `calendar`) `oklch(90% 0.006 90)` na białym = **1,35:1** (wymagane 3:1). Pole bez wypełnienia jest identyfikowalne tylko po ramce. | `tokens.css:259` (+ dropdown/textarea) | **P1** |
| 3.1.1 Język strony | `<html lang="en">` przy polskiej treści — czytnik ekranu czyta polski tekst z angielską wymową. | `index.html:2` | **P1** |
| 2.3.3 Animacje (AAA, tanie) | Brak `prefers-reduced-motion`; animacje PrimeReact (dialog, overlaye) zawsze aktywne. | globalnie | P2 |
| 1.4.4 Zmiana rozmiaru tekstu | Rozmiary w `px` (33 wartości). Zoom przeglądarki działa, ale ustawienie „rozmiar czcionki” w przeglądarce nie skaluje UI. | `tokens.css`, inline TSX | P2 |
| 1.4.3 Kontrast (pogranicze) | Tekst 11–11,5px: badge (`tokens.css:200`) i etykiety w tabeli stackowanej (`tokens.css:870`). Kontrast OK (≥5:1), ale rozmiar poniżej 12px utrudnia czytanie. | `tokens.css:200, 870` | P3 |

Kontrast tokenów (light), policzony z wartości oklch:

| Para | Wynik | Próg |
|---|---|---|
| text / surface | 17,31 | 4,5 ✅ |
| text-secondary / surface | 6,00 | 4,5 ✅ |
| text-muted / surface · bg | 4,85 · 4,62 | 4,5 ✅ |
| biały / accent · accent-hover | 4,95 · 7,31 | 4,5 ✅ |
| accent-hover / accent-soft (aktywna nawigacja, tag info, datepicker) | 6,30 | 4,5 ✅ |
| biały / danger | 7,11 | 4,5 ✅ |
| success · warning · danger · ended · neutral na swoim `-soft` | 6,02 · 6,70 · 5,93 · 8,63 · 5,18 | 4,5 ✅ |
| kolory kafla „dark” na ink | 7,08–9,13 | 4,5 ✅ |
| **border-strong / surface (ramka pól)** | **1,35** | **3 ❌** |
| border / surface (ramka kart) | 1,23 | dekoracyjna, nie dotyczy |

## Proponowany plan

1. **Jedno źródło prawdy**: przenieść definicję tokenów z `.kwatera-a` na `body[data-ku-theme='a']` (obejmuje i stronę, i portale), a 71 literałów w nadpisaniach PrimeReact zamienić na `var(--ku-*)`. Dodać brakujące tokeny stanów: `--ku-accent-hover-soft`, `--ku-secondary-hover`, `--ku-danger-hover`, `--ku-disabled-bg/-text`, `--ku-focus-ring`, oraz `--ku-input-border`.
2. **Skale**: tokeny typografii (`--ku-text-xs…2xl` w rem: 12/13/14/16/18/26 px) i odstępów (siatka 4px: 4/8/12/16/20/24/32). Snap 12.5→12/13, 13.5→13/14, 11/11.5→12, 6/10/14/18 → najbliższe z siatki.
3. **Komponenty**: `PageLayout` (wrapper strony zamiast inline flex/gap), warianty `Card` zamiast liczbowego `padding`, `NameDialog` → `FormDialog`, kolory `StatTile` → tokeny.
4. **WCAG**: ramka pól → `oklch(64% 0.006 90)` (3,36:1 na surface, 3,20:1 na bg) albo L62 (3,64/3,47); `lang="pl"`; blok `prefers-reduced-motion`.
5. **Weryfikacja**: `tsc -b`, eslint, Playwright 375/1280 na wszystkich 7 widokach + dialogach, ponowny skan i porównanie.

## Wynik (2026-11-13)

Zrobione: pełny plan (tokeny, skale, komponenty, WCAG). Szczegóły: `TOKENS.md`, mapa zmian i lista zmian widocznych: `MIGRATION.md`.

| Miara (`new_ui`) | Przed | Po |
|---|---|---|
| Literały `oklch` poza blokiem tokenów | 71 | 0 |
| Kolory w TSX (oklch/hex) | 6 | 0 |
| Unikalne `font-size` | 33 | 1 (`clamp` z tokenów) |
| Unikalne wartości odstępów | 62 | 13 (głównie `0` i resztki inline) |
| Unikalne `border-radius` | 8 | 3 |
| Inline `style={{…}}` | 76 w 19 plikach | 64 w 16 plikach |
| `!important` | 3 | 7 (+4 w bloku `prefers-reduced-motion`, celowo) |

WCAG: obrys pól 1,35 → 3,36:1 (1.4.11), `lang="pl"` (3.1.1), `prefers-reduced-motion` (2.3.3), tekst w `rem` (1.4.4), brak tekstu < 12 px.

Weryfikacja: `tsc -b` ✅, eslint 0 błędów (2 ostrzeżenia Fast Refresh sprzed migracji), Playwright 375 i 1280 px na 7 widokach i dialogu — bez poziomego przewijania i bez błędów JS. axe nie był uruchamiany.

Zostało:
- 64 inline style to głównie layout jednorazowy (flex/grid stron Mieszkania i Dashboard) — kandydaci na klasy `.ku-*`, nie na tokeny.
- `--ku-shadow-sm/md` zapisane w `rgba`, a `--ku-shadow-overlay` w `oklch` — ta sama barwa, do ujednolicenia przy okazji.
- Tekst bazowy aplikacji to 14 px (gęsty UI operacyjny); świadomie poniżej ogólnej rekomendacji 16 px.
- Skaner nie rozpoznaje `oklch()` — kolory liczone osobno.

Rekomendacja: stylelint z `declaration-strict-value` dla `color`, `background`, `border-color`, `font-size`, `gap`, `padding`, `margin` w `new_ui/**/*.css`, żeby literały nie wróciły.
