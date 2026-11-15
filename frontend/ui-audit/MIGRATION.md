# Migracja na tokeny — zmiany

## Mapa wartości → token

| Stara wartość | Token |
|---|---|
| `oklch(55% 0.16 260)` ×17 | `--ku-accent` |
| `oklch(46% 0.16 260)` ×8 | `--ku-accent-hover` |
| `oklch(50% 0.01 260)` ×7 | `--ku-text-secondary` |
| `oklch(93% / 94% 0.006 90)` | `--ku-border` |
| `oklch(90% 0.006 90)` | `--ku-border-strong`; w obrysie pól → `--ku-input-border` |
| `oklch(22% 0.012 260)` | `--ku-text` |
| `0 0 0 2px #fff, 0 0 0 4px <accent>` ×3 | `--ku-focus-ring` |
| pozostałe hover/disabled/tint | nowe tokeny stanów (zob. TOKENS.md) |
| kolory kafla w `StatTile.tsx` | `--ku-on-ink-*` |
| `font-size` 11 / 11,5 / 12 / 12,5 / 13 / 13,5 / 14 / 15 / 16 / 1,05rem / 18 / 20 / 24 / 26 / 28 | `--ku-text-xs…3xl` |
| odstępy px (CSS i inline TSX) | `--ku-space-*` |
| `Card padding={0/18/20/24/28}` | `padding="none" / "md" / "lg"` |
| wrapper strony `flex column gap 20/24/28` (7 stron) | klasa `.ku-page` |

## Zmiany widoczne gołym okiem

- **Ramki pól formularza** wyraźnie ciemniejsze (1,35:1 → 3,36:1) — wymóg WCAG 1.4.11.
- **Tytuł strony (h1)** 26 → 28 px.
- **Odstęp między sekcjami strony** ujednolicony do 20 px (Dashboard miał 28, Mieszkania 24).
- **Teksty 11–11,5 px** (badge, etykiety w tabeli na telefonie, podpisy dolnej nawigacji) → 12 px.
- **Przyciski, pola, tabela** 13,5 → 14 px; **podpowiedzi i błędy** 12,5 → 13 px; nagłówki 15 → 16 px; tytuł dialogu 16,8 → 16 px.
- **Odstępy spoza siatki 4px** przyciągnięte: 6→8, 10→8, 14→16, 18→20, 28→24, 36→40, 56→48, 60→64 px (np. padding kafli statystyk 18 → 20, panel szczegółów mieszkania 28 → 24).
- Promień `.ku-detail-list-compact` 10 → 8 px.

## Inne

- `NameDialog` przepisany na `FormDialog` + `TextField` (ten sam wygląd i fokus co pozostałe dialogi).
- `index.html`: `lang="pl"`.
- `prefers-reduced-motion`: animacje i przejścia wyłączone; przewinięcie do szczegółów mieszkania bez animacji.
