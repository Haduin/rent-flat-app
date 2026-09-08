# Struktura projektu — React + TanStack Query + OpenAPI Generator

## Drzewo katalogów

```
src/
│
├── generated-api/                        # AUTO-GENERATED — nie edytować ręcznie
│   ├── apis/
│   │   ├── NAMEApi.ts
│   │   └── NAMEApi.ts
│   ├── models/
│   │   ├── NAMEWithDetails.ts
│   │   └── NAMEDetails.ts
│   └── runtime.ts
│
├── api/                                  # Konfiguracja i query keys — globalny setup
│   ├── clients.ts                        # Instancje wygenerowanych klientów + Configuration
│   └── queryKeys.ts                      # Wszystkie query keys w jednym miejscu
│
├── features/                             # Podział per domena biznesowa
│   │
│   ├── name/                           # Domena A
│   │   ├── api/
│   │   │   ├── useName.ts              # useQuery / useMutation hooki
│   │   │   └── name.mapper.ts          # DTO (generated) → typ lokalny
│   │   ├── types/
│   │   │   └── name.types.ts           # Lokalne typy UI (niezależne od API)
│   │   ├── components/
│   │   │   └── NameCard.tsx            # Komponenty specyficzne dla domeny
│   │   └── index.ts                      # Barrel — publiczne API modułu
│   │
│   └── name/                           # Domena B (analogiczna struktura)
│       ├── api/
│       │   ├── useName.ts
│       │   └── name.mapper.ts
│       ├── types/
│       │   └── name.types.ts
│       ├── components/
│       │   └── NameList.tsx
│       └── index.ts
│
├── pages/                                # Tylko routing i kompozycja — zero logiki
│   ├── NamePage.tsx
│   └── NamePage.tsx
│
├── components/                           # Współdzielone komponenty UI
│   └── ui/
│       ├── Button.tsx
│       ├── Spinner.tsx
│       └── Modal.tsx
│
└── lib/                                  # Konfiguracja zewnętrznych bibliotek
    └── queryClient.ts                    # new QueryClient(...)
```

---

## Zawartość plików

### `api/clients.ts`

```ts
// Jeden plik — wszystkie instancje klientów API
// Configuration z auth middleware żyje tutaj

const config = new Configuration({
    basePath: import.meta.env.VITE_BACKEND_URL,
    middleware: [authMiddleware],           // token, refresh, 401 handling
});

export const nameApi = new NameApi(config);
export const nameApi = new NameApi(config);
```

### `api/queryKeys.ts`

```ts
// Centralne query keys — używane w hookach i przy inwalidacji

export const nameKeys = {
    all: ["name"] as const,
    lists: () => [...nameKeys.all, "list"] as const,
    detail: (id: number) => [...nameKeys.all, id] as const,
};

export const nameKeys = {
    all: ["name"] as const,
    byParent: (parentId: number) => [...nameKeys.all, parentId] as const,
};
```

---

### `features/name/types/name.types.ts`

```ts
// Lokalny typ UI — niezależny od kształtu API
// Tylko pola których faktycznie używa UI

export type Name = {
    id: number;
    name: string;
    // ... pola potrzebne UI, nie API
};
```

### `features/name/api/name.mapper.ts`

```ts
// Mapper: DTO z generated-api → lokalny typ UI
// Jedyne miejsce które importuje z generated-api

import {NameDTO} from "@/generated-api/models";
import {Name} from "../types/name.types";

export function toName(dto: NameDTO): Name {
    return {
        id: dto.nameId,
        name: dto.nameName,
        // transformacje, wyliczane pola, formatowanie dat itp.
    };
}
```

### `features/name/api/useName.ts`

```ts
// Hooki — granica między API a UI
// Komponent nigdy nie widzi surowego DTO

import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {nameApi} from "@/api/clients";
import {nameKeys} from "@/api/queryKeys";
import {toName} from "./name.mapper";

export function useNameList() {
    return useQuery({
        queryKey: nameKeys.lists(),
        queryFn: async () => {
            const data = await nameApi.getAllNames();
            return data.map(toName);
        },
    });
}

export function useCreateName() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateNameRequest) =>
            nameApi.createName({body}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: nameKeys.lists()});
        },
    });
}
```

### `features/name/index.ts`

```ts
// Barrel — eksportuj tylko publiczne API modułu
// Wewnętrzna struktura katalogów jest szczegółem implementacji

export {useNameList, useCreateName} from "./api/useName";
export type {Name} from "./types/name.types";
// komponenty i mapper zostają wewnętrzne jeśli nie są potrzebne na zewnątrz
```

### `pages/NamePage.tsx`

```tsx
// Strona = tylko kompozycja i routing
// Zero useQuery, zero logiki biznesowej

import {NameList} from "@/features/name";

export function NamePage() {
    return <NameList/>;
}
```

---

## Zasady importów

```
pages/          → features/*/index.ts, components/ui/
features/name → api/clients, api/queryKeys, generated-api (tylko w mapperze)
components/ui/  → nic z features/ ani api/
```

> `features/` nie importują między sobą.
> Jeśli dwie domeny potrzebują tego samego typu — trafia do `src/types/` na poziomie globalnym.

---

## Co żyje gdzie — ściągawka

| Co                                     | Gdzie                           |
|----------------------------------------|---------------------------------|
| Wygenerowane typy i klienty            | `generated-api/`                |
| Konfiguracja auth + instancje klientów | `api/clients.ts`                |
| Query keys                             | `api/queryKeys.ts`              |
| Lokalny typ UI                         | `features/name/types/`          |
| Mapper DTO → UI                        | `features/name/api/*.mapper.ts` |
| useQuery / useMutation                 | `features/name/api/use*.ts`     |
| Komponenty domenowe                    | `features/name/components/`     |
| Publiczne API modułu                   | `features/name/index.ts`        |
| Routing i kompozycja                   | `pages/`                        |
| Współdzielone UI                       | `components/ui/`                |
| QueryClient config                     | `lib/queryClient.ts`            |