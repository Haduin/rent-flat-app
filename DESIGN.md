---
name: Mieszkania
description: Calm, flat, light operating console for a single landlord's rental bookkeeping.
colors:
  ledger-blue: "oklch(55% 0.16 260)"
  ledger-blue-deep: "oklch(46% 0.16 260)"
  ledger-blue-soft: "oklch(95% 0.03 260)"
  ledger-blue-wash: "oklch(97% 0.02 260)"
  on-accent: "#ffffff"
  paper: "oklch(98.3% 0.004 90)"
  surface: "#ffffff"
  surface-sunken: "oklch(97% 0.004 90)"
  hairline: "oklch(93% 0.006 90)"
  hairline-strong: "oklch(90% 0.006 90)"
  ink: "oklch(22% 0.012 260)"
  ink-secondary: "oklch(50% 0.01 260)"
  ink-muted: "oklch(55% 0.008 260)"
  status-paid: "oklch(45% 0.14 150)"
  status-paid-soft: "oklch(95% 0.04 150)"
  status-pending: "oklch(45% 0.14 70)"
  status-pending-soft: "oklch(96% 0.05 80)"
  status-overdue: "oklch(48% 0.16 25)"
  status-overdue-soft: "oklch(95% 0.04 25)"
  status-ended: "oklch(38% 0.13 18)"
  status-ended-soft: "oklch(93% 0.025 18)"
  disabled-fill: "oklch(95% 0.004 90)"
  disabled-text: "oklch(72% 0.006 90)"
typography:
  display:
    fontFamily: "Sora, Public Sans, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  stat:
    fontFamily: "Sora, Public Sans, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
  headline:
    fontFamily: "Sora, Public Sans, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
  title:
    fontFamily: "Sora, Public Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
  caption:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
  label:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.03em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  gutter-mobile: "14px"
  gutter-desktop: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ledger-blue}"
    textColor: "{colors.on-accent}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "9px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ledger-blue-deep}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "9px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-sunken}"
  button-disabled:
    backgroundColor: "{colors.disabled-fill}"
    textColor: "{colors.disabled-text}"
  badge-paid:
    backgroundColor: "{colors.status-paid-soft}"
    textColor: "{colors.status-paid}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-pending:
    backgroundColor: "{colors.status-pending-soft}"
    textColor: "{colors.status-pending}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-overdue:
    backgroundColor: "{colors.status-overdue-soft}"
    textColor: "{colors.status-overdue}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-ended:
    backgroundColor: "{colors.status-ended-soft}"
    textColor: "{colors.status-ended}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "20px"
  stat-tile-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-accent}"
    typography: "{typography.stat}"
    rounded: "{rounded.md}"
    padding: "18px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
  nav-item-active:
    backgroundColor: "{colors.ledger-blue-soft}"
    textColor: "{colors.ledger-blue-deep}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  table-header:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.label}"
    padding: "12px 16px"
---

# Design System: Mieszkania

## Overview

**Creative North Star: "The Quiet Console"**

Mieszkania is a minimal control panel for one expert user doing routine bookkeeping. The interface stays out of the way: a warm off-white page, white surfaces separated by hairline borders, a single blue for "you can act here", and soft status pills that carry the only other color on the screen. The goal is to answer *who owes, what it costs, what is occupied* in a single scan, on a phone as well as on desktop.

Density is moderate and table-first. Text runs small (13.5px body), headings are compact and set in Sora for a slightly geometric, confident voice, and numbers are given the most visual weight on the page (stat values at 28px). Nothing is decorative: no gradients, no illustrations, no resting shadows.

The system is implemented as a scoped theme on top of PrimeReact: `.kwatera-a` carries the `--ku-*` custom properties and base typography, and `body[data-ku-theme='a']` restyles PrimeReact components, including portaled overlays (Dialog, Calendar, Toast, ConfirmDialog). The legacy UI (`/protected/*`) is not a reference.

**Key Characteristics:**
- Light only; warm paper background, white surfaces, cool ink text.
- One action color (Ledger Blue); status colors reserved for status.
- Flat: depth by 1px borders and tonal steps, not shadows.
- Every list is a `DataTableCard` that stacks into cards at ≤1024px.
- Mobile reflow down to 360px is a requirement, not a nice-to-have.

## Colors

A restrained, near-neutral palette: warm-tinted neutrals (hue 90) for surfaces and borders, cool-tinted neutrals (hue 260) for text, one blue for interaction, and four soft status pairs.

### Primary
- **Ledger Blue** (`ledger-blue`): primary buttons, the logo tile, links, selected SelectButton option, active paginator page, checked checkboxes, input focus border. The signal for "this is the action" or "this is selected".
- **Ledger Blue Deep** (`ledger-blue-deep`): hover/pressed state of primary buttons and links; text of the active nav item.
- **Ledger Blue Soft** (`ledger-blue-soft`): active nav item background, selected dropdown/calendar option, stat-tile icon chip, `accent` badge.
- **Ledger Blue Wash** (`ledger-blue-wash`): hover background for table rows and nav items. Barely there; it confirms the pointer, nothing more.

### Neutral
- **Paper** (`paper`): page background behind everything.
- **Surface** (`surface`): cards, tables, menubar, inputs, secondary buttons.
- **Surface Sunken** (`surface-sunken`): table header row, secondary-button hover. Even table rows use a near-identical stripe (`oklch(98% 0.003 90)`).
- **Hairline** (`hairline`) / **Hairline Strong** (`hairline-strong`): card and table borders / input and secondary-button borders.
- **Ink** (`ink`): primary text and the dark stat tile background.
- **Ink Secondary** (`ink-secondary`): subtitles, table header labels, stacked-card field labels, inactive nav items.
- **Ink Muted** (`ink-muted`): tertiary hints such as "wolny" under a free room.

### Status
Each status is a pair: strong text on a soft tint of the same hue, always rendered as a pill badge or a stat caption.
- **Paid / OK** (`status-paid` on `status-paid-soft`): paid, active.
- **Pending / Warning** (`status-pending` on `status-pending-soft`): due soon, needs attention.
- **Overdue / Danger** (`status-overdue` on `status-overdue-soft`): overdue, past end date but still active.
- **Ended** (`status-ended` on `status-ended-soft`): a darker oxblood kept deliberately distinct from Danger, so "finished" never reads as "problem".
- **Neutral** (`ink-secondary` on a warm neutral tint): inactive, no status.

### Named Rules
**The Color Is Status Rule.** Green, amber, red and oxblood appear only as payment or contract status (badges, stat captions). They are never used for decoration, section accents, icons or illustration.

**The Ended Is Not Danger Rule.** An ended contract uses the oxblood Ended pair, never the Danger pair; Danger is reserved for states that need action.

## Typography

**Display Font:** Sora (with Public Sans, system-ui)
**Body Font:** Public Sans (with system-ui, -apple-system)

**Character:** Sora gives headings and numbers a compact, slightly geometric confidence; Public Sans is a sober, highly legible workhorse for dense tables and forms. Both load from Google Fonts (Sora 500–700, Public Sans 400–600). `.kwatera-a` sets a unitless line-height of 1.5 (headings 1.2, stat values 1.2) so the new UI never inherits the legacy fixed 24px.

### Hierarchy
- **Display** (Sora 700, 26px, -0.01em): page title in `PageHeader`, one per page.
- **Stat** (Sora 700, 28px): KPI values in `StatTile`. The largest type on the page is a number.
- **Headline** (Sora 700, 20px): detail-pane heading (e.g. the selected apartment).
- **Title** (Sora 600, 14–16px): card and section headings (apartment card, "Pokoje", "Mieszkania"); PrimeReact card titles at 16px.
- **Body** (Public Sans 400, 13.5px): table cells, inputs, buttons (600 on buttons); page subtitles at 14px.
- **Caption** (Public Sans 500–600, 12.5–13px): secondary lines in cards, stat labels and captions.
- **Label** (Public Sans 600, 11–12px, 0.03em, uppercase): table column headers and stacked-card field labels. Badges use 11.5px/600 in normal case.

### Named Rules
**The Numbers Lead Rule.** Amounts and counts get Sora and the heaviest weight in their container; their labels stay small and secondary.

**The No Mid-Word Break Rule.** The theme sets `overflow-wrap: anywhere` globally (so "1 550,00 zł" can't blow out narrow tracks), but table headers and stacked labels are `nowrap`, and table cells use `break-word`. Labels never break inside a word.

## Layout

- **Shell:** a sticky 72px-tall white menubar (logo + nav + avatar) over a paper content area. Content padding is 36px 40px 56px on desktop and 18px 14px 40px at ≤720px.
- **Page rhythm:** pages are a single vertical flex column with 20–28px gaps (20px on list pages, 24px apartments, 28px dashboard). Inside cards, 10–14px gaps.
- **Grids:** KPI row (16px gap) is five equal columns at ≥1440px; three columns at 861–1439px with the net-result tile first, spanning two rows as the headline; one column of ledger lines (8px gap) at ≤860px; card grids `repeat(auto-fill, minmax(320px, 1fr))` with 14px gap; room tiles `minmax(140px, 1fr)` with 10px gap.
- **Split layout:** master/detail at 380px + 1fr (20px gap), collapsing to one column at ≤860px.
- **Breakpoints:** 520px (filters go full-width, SelectButton options share one row at 44px height; header shows the logo tile only), 720px (shell padding), 860px (split layout; dashboard KPI tiles become one-per-row ledger lines with the net result first), 1024px (tables stack into cards; bottom tab bar replaces the header nav), 1025–1439px (optional columns hidden; compact desktop header: logo tile only, tighter nav, 24px header padding; KPI row in three columns), 1440px+ (everything shown).
- **Touch targets:** in stacked tables, row-action buttons and paginator elements are at least 44×44px (`2.75rem`).

### Named Rules
**The No Horizontal Scroll Rule.** No page scrolls sideways at 360, 900, 1040 or 1280px. Low-priority columns are flagged `optional` instead of letting the table overflow.

## Elevation & Depth

The system is flat. Surfaces sit on the paper background, separated by a 1px hairline border and a tonal step (paper → surface → sunken header). Resting cards have no shadow.

### Shadow Vocabulary
- **Hairline lift** (`box-shadow: 0 1px 2px rgba(20, 20, 40, 0.04)`): defined as `--ku-shadow-sm`; available for the faintest separation.
- **Highlight** (`box-shadow: 0 8px 24px -14px rgba(20, 20, 40, 0.18)`): only on a `highlighted` card, together with a 1.5px Ledger Blue border, to mark the selected item.

### Named Rules
**The Flat By Default Rule.** Surfaces separate by border and tone. A shadow appears only to mark the highlighted or selected element; never add one to a card at rest.

## Shapes

Soft, consistent rounding that grows with the size of the container: 8px for controls (buttons, inputs, nav items, logo tile, icon chips), 12px for cards, tables and stacked table rows, 16px for dialogs, and full pills for badges, the avatar and `rounded` buttons. Borders are always 1px (1.5px only for a highlighted card). Dialogs clip their content to the 16px corner.

## Components

### Buttons
Compact and solid; text in Public Sans 600 at 13.5px.
- **Shape:** gently rounded (8px), padding 9px 16px; icon and text separated by an 8px gap.
- **Primary:** Ledger Blue fill, white text; hover deepens to Ledger Blue Deep.
- **Secondary:** white fill, Hairline Strong border, Ink text; hover to Surface Sunken.
- **Danger outline:** PrimeReact danger outlined, for destructive row actions.
- **Ghost:** text-only button for low-emphasis actions.
- **Disabled:** every variant flattens to the same muted gray fill and text (full opacity, `not-allowed` cursor), so "off" is legible even on small icon-only buttons.
- Use the `Button` wrapper (`variant`: primary / secondary / danger-outline / ghost), not PrimeReact `severity` props directly.

### Badges (status pills)
- **Style:** pill (999px), 4px 10px, 11.5px/600, strong status text on its soft tint, no border. Every tone must reach ≥4.5:1; the `info`/`accent` tone uses Ledger Blue Deep text (6.3:1) because Ledger Blue on its tint is only 4.2:1.
- **Tones:** success, warning, danger, ended, neutral, accent via the `Badge` component.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Surface on Paper.
- **Shadow Strategy:** none at rest; see Elevation (highlighted only).
- **Border:** 1px Hairline; 1.5px Ledger Blue when highlighted.
- **Internal Padding:** 20px default (18px stat tiles, 0 for table cards). Child layout goes in `contentStyle`, not `style`.

### Stat Tiles
Label (13px/500, Ink Secondary) with an optional 28px Ledger Blue Soft icon chip, a 28px Sora 700 value, and an optional caption. Values never wrap (`nowrap`). The **dark** variant (Ink background, white value, light-gray label) is the single headline figure, the net result; its value is `clamp(28px, 3vw, 36px)` in the three-column layout and 24px in the ledger (other values 18px there). Its caption is light gray when neutral and light green only as a status.
- **Captions follow the data:** occupancy is green at ≥70%, amber below, neutral with no rooms (the same threshold as the apartment badge). Captions that only define a figure ("opłacone i częściowo opłacone", "media, podatki, czynsz właściciela", "wpłaty − koszty") are neutral.

### Tables (`DataTableCard`)
The only way to render a list. A Card with 0 padding wrapping a striped, paginated (10/20/50) DataTable.
- **Header:** Surface Sunken, uppercase 12px/600 labels in Ink Secondary, 12px 16px, `nowrap`.
- **Rows:** white with a near-white stripe; 13px 16px cells; hover to Ledger Blue Wash.
- **Actions:** last column, content-width, right-aligned row of buttons.
- **≤1024px:** each row becomes a 12px-rounded bordered card; each cell is a label-left / value-right line; actions move to their own row under a divider; 44px touch targets.

### Inputs / Fields
- **Style:** white, 1px Hairline Strong border, 8px radius, 13.5px text. Search inputs are max 320px wide, full-width at ≤520px.
- **Focus:** border turns Ledger Blue with a 1px Ledger Blue ring at 30% alpha.
- **Forms:** live in PrimeReact dialogs (16px radius, Sora header).

### Navigation
- **Desktop (≥1025px):** a sticky 72px PrimeReact Menubar inside `<header>`. The logo tile (30px Ledger Blue square, white house icon) and the Sora 700 18px "Mieszkania" wordmark form one link to the dashboard (wordmark shown from 1440px; 1025–1439px shows the tile only). Nav items are 14px/500 Ink Secondary, 8px 14px (8px 10px in the compact header), 8px radius. Hover is Ledger Blue Wash; the active item is Ledger Blue Soft with Ledger Blue Deep text at 600. The house belongs to the brand only; the "Mieszkania" section uses a building icon.
- **Month chip (the shell's anchor):** in the header end slot, shown only on month-scoped pages (Dashboard, Wpłaty, Koszty; `MONTH_SCOPED_PATHS` in AppShell) and hidden elsewhere (the phone header is then the logo alone). It is the only month control on those pages. A white group with a 1px Hairline Strong border and 8px radius: chevron step buttons (Ink Secondary, Paper on hover; 36px on desktop, 44px at ≤1024px) around a label button in Public Sans 600 13.5px Ink ("listopad 2026" via `formatMonthLabel`, min-width 8.5rem, nowrap, Paper on hover), named "Wybierz miesiąc, obecnie …". It defaults to today's month. Every month shown to people uses this same format (e.g. "Wygeneruj płatności za listopad 2026"); `yyyy-mm` is for the API only.
- **Month picker:** the chip label opens a PrimeReact OverlayPanel with an inline `Calendar view="month"`: `min(17rem, 100vw − 32px)` wide, white, 1px Hairline Strong border, 12px radius, soft offset shadow; year header with arrows over a 3×4 grid of short Polish month names, the selected month in Ledger Blue Soft / Deep. Picking a month sets it and closes the panel; a full-width secondary "Bieżący miesiąc" button appears only when another month is selected. Esc or an outside click closes it; focus goes to the selected month on open and back to the label on close. Targets are 44px at ≤1024px.
- **Phone/tablet (≤1024px):** the Menubar nav and PrimeReact's hamburger are hidden. The header shrinks to 60px (logo + month chip; ≤520px logo tile only) and scrolls away. A fixed bottom tab bar (`BottomNav`) shows Dashboard, Wpłaty, Koszty, Kontrakty and „Więcej”, each a 52px icon-over-label tab (11.5px) with the same active treatment. „Więcej” opens a bottom sheet (PrimeReact Sidebar, 16px top corners, no shadow) holding Mieszkania, Szablony kosztów and Osoby as 48px rows, then "Wyloguj się" under a hairline divider. Content pads its bottom to clear the bar and the safe area.
- **Logout:** no avatar. At ≥1025px a small secondary "Wyloguj" button sits at the header end, right of the month chip; at ≤1024px it is the last row of the „Więcej” sheet. Both open the same confirmation ("Wylogowanie", focus on "Nie").
- **Focus:** shell links and buttons show a 2px Ledger Blue outline at 2px offset on `:focus-visible`. PrimeReact controls (buttons, checkboxes, dialog close, paginator, calendar cells) use one ring: `0 0 0 2px #fff, 0 0 0 4px` Ledger Blue. Text inputs keep the Ledger Blue border with a 1px 30% halo.
- Each route sets `document.title` to "<section> · Mieszkania", or just "Mieszkania" where the section has the product's name.

### Filter toggles (SelectButton)
Unselected options are white with a hairline border and Ink Secondary text; the selected option is solid Ledger Blue. At ≤520px the options share one full-width row, 44px tall.

## Do's and Don'ts

### Do:
- **Do** use the `--ku-*` custom properties inside `.kwatera-a`, and the `ui/` wrappers (`Button`, `Badge`, `Card`, `StatTile`, `PageHeader`, `DataTableCard`).
- **Do** render every list through `DataTableCard`, with `optional: true` on secondary columns.
- **Do** keep stacked-table touch targets at 44×44px (`2.75rem`) and check layouts at 360, 900, 1040 and 1280px.
- **Do** give amounts and counts the strongest type in their container (Sora, 600–700).
- **Do** mark a selected card with the `highlighted` prop (Ledger Blue border + Highlight shadow) rather than a fill change.

### Don't:
- **Don't** use status colors (green, amber, red, oxblood) for anything other than status.
- **Don't** add shadows to resting cards, tables or tiles.
- **Don't** use the Danger pair for ended contracts; use Ended.
- **Don't** import `primereact/datatable` or `primereact/column` directly in pages.
- **Don't** let headers or labels break mid-word, and don't let any page scroll horizontally.
- **Don't** take visual cues from the legacy `/protected/*` UI.
