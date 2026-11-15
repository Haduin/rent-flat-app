# Tokeny UI — `new_ui` (kierunek „A”)

Jedno źródło: `new_ui/theme/tokens.css`, blok `body[data-ku-theme='a'], .kwatera-a`.
Na `<body>`, bo Dialog/Calendar/Dropdown/Toast PrimeReact renderują się w portalach poza `.kwatera-a`.
Komponenty i nadpisania PrimeReact używają wyłącznie `var(--ku-*)`; surowe wartości są tylko w tym bloku.

## Kolory (light; dark mode nie ma w briefie)

| Token                                                                                   | Wartość                      | Użycie                                                       |
| --------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| `--ku-bg` / `--ku-surface`                                                              | oklch(98.3% 0.004 90) / #fff | tło strony / karty, dialogi                                  |
| `--ku-border` / `--ku-border-strong`                                                    | oklch(93/90% 0.006 90)       | podział kart i wierszy (dekoracyjny)                         |
| `--ku-input-border`                                                                     | oklch(64% 0.006 90)          | **tylko** obrys kontrolek formularza (WCAG 1.4.11)           |
| `--ku-text` / `-secondary` / `-muted`                                                   | oklch(22/50/55% …)           | tekst; `muted` tylko na `bg`/`surface`                       |
| `--ku-accent` / `-hover` / `-soft` / `-soft-strong` / `-tint` / `-border` / `-contrast` | Ledger Blue i jego stany     | akcja główna, aktywna nawigacja, hover ghost, obrys outlined |
| `--ku-success/-warning/-danger/-ended/-neutral` + `-soft`                               |                              | statusy (tekst na swoim `-soft`)                             |
| `--ku-danger-hover`                                                                     | oklch(41% 0.16 25)           | hover przycisku destrukcyjnego                               |
| `--ku-surface-hover` / `--ku-surface-striped`                                           |                              | hover secondary / pasy tabeli                                |
| `--ku-disabled-bg` / `--ku-disabled-text`                                               |                              | wszystkie wyłączone kontrolki                                |
| `--ku-ink`, `--ku-on-ink`, `--ku-on-ink-muted/-success/-warning/-danger`                |                              | ciemny kafel „Wynik netto”                                   |
| `--ku-focus-ring` / `--ku-focus-halo`                                                   |                              | fokus kontrolek / poświata pól                               |

## Skale

- Tekst (rem): `xs` 12 · `sm` 13 · `base` 14 · `md` 16 · `lg` 18 · `xl` 20 · `2xl` 24 · `3xl` 28 px.
- Odstępy (siatka 4px): `0-5` 2 · `1` 4 · `2` 8 · `3` 12 · `4` 16 · `5` 20 · `6` 24 · `8` 32 · `10` 40 · `12` 48 · `16` 64 px.
- Radius: `sm` 8 · `md` 12 · `lg` 16 · `pill`. Cienie: `sm`, `md`, `overlay`. Warstwa: `--ku-z-sticky`.
- Fonty: `--ku-font-display` (Sora), `--ku-font-body` (Public Sans).

## Kontrast (WCAG 2.2 AA, policzony z oklch → sRGB)

| Para                                    | Wynik         | Próg   |
| --------------------------------------- | ------------- | ------ |
| text / surface · bg                     | 17,31 · 16,49 | 4,5 ✅ |
| text-secondary / surface · bg           | 6,00 · 5,71   | 4,5 ✅ |
| text-muted / surface · bg               | 4,85 · 4,62   | 4,5 ✅ |
| accent-contrast / accent · accent-hover | 4,95 · 7,31   | 4,5 ✅ |
| accent-hover / accent-soft              | 6,30          | 4,5 ✅ |
| biały / danger                          | 7,11          | 4,5 ✅ |
| statusy na `-soft`                      | 5,18–8,63     | 4,5 ✅ |
| on-ink-* / ink                          | 7,08–9,13     | 4,5 ✅ |
| input-border / surface · bg             | 3,36 · 3,20   | 3 ✅   |

Zasady: `accent` jako tekst tylko na `surface`/`bg` (na `accent-soft` używaj `accent-hover`); `border`/`border-strong` nigdy jako jedyny obrys pola formularza.
