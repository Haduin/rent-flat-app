# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One user: the owner, a private landlord managing their own apartments and rooms. Used for routine (mostly monthly) bookkeeping — checking who paid, entering costs, updating contracts — on desktop and phone.

## Product Purpose

Mieszkania replaces the landlord's spreadsheet for running a small rental portfolio. Success means the owner can answer three questions at a glance, without manual reconciliation:

1. **Who paid and who owes** — rent payments per contract, with arrears visible quickly.
2. **What it costs and what it earns** — recurring and one-off expenses (recurring ones generated from expense templates) against income, per apartment.
3. **What is occupied** — which rooms are rented, to whom, and when contracts end.

## Positioning

A personal tool built around one landlord's actual workflow, not a generic multi-tenant property-management SaaS. No roles, onboarding, or marketing surfaces are needed.

## Operating Context

- Domain model: apartments → rooms → contracts (with persons/tenants) → income payments; expenses and expense templates per apartment; a dashboard with statistics.
- Auth via Keycloak login; the app lives behind `/protected/*`. The new UI is under `/protected/v2/*` and is replacing the legacy UI.
- UI language is Polish. Nav terms: Dashboard, Mieszkania, Kontrakty, Wpłaty, Koszty, Szablony kosztów, Osoby.

## Capabilities and Constraints

- Existing: CRUD for apartments, rooms, contracts, persons; income payment tracking with statuses; expense and expense-template management; dashboard statistics.
- Planned, not built: notifications to tenants confirming a payment was received; a native mobile app (Android, Kotlin/Compose) as a separate client of the same backend.
- Open: notification channel (email/SMS/other) is undecided.
- Money and dates are Polish-locale (PLN, Polish date formats).

## Brand Commitments

- Name: **Mieszkania**. "Kwatera" appears in the new UI shell and design explorations but is not the binding name.

## Evidence on Hand

- Real data is the owner's own portfolio; there are no customers, testimonials, or public metrics, and none should be invented.
- Design explorations: `design/ui-inspiracja/` (inspiration only, not approved direction).

## Product Principles

1. Answer "who owes, what it costs, what's occupied" faster than a spreadsheet would.
2. Operate, don't persuade: dense, scannable, task-first screens for a single expert user.
3. Works on a phone for quick checks, not just desktop.
4. Keep the web app and the future mobile client on the same backend truth; no web-only business logic.
