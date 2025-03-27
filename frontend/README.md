# Mieszkania - Aplikacja Zarządzania Nieruchomościami

## Opis Projektu

Aplikacja webowa do kompleksowego zarządzania nieruchomościami, umożliwiająca obsługę umów najmu, płatności i
podstawowych operacji związanych z wynajmem mieszkań.

## Technologie

- Frontend:
    - React
    - TypeScript
    - Vite
    - PrimeReact
    - React Router
    - Keycloak (autoryzacja)

- Narzędzia deweloperskie:
    - ESLint
    - Tailwind CSS

## Wymagania Wstępne

- Node.js
- npm

## Instalacja

1. Sklonuj repozytorium
2. Zainstaluj zależności:
   ```bash
   pnpm install
   ```

3. Uruchom serwer deweloperski:
   ```bash
   pnpm run dev
   ```

## Główne Funkcje

- Zarządzanie umowami najmu
- Śledzenie płatności
- Autentykacja użytkowników

## Proces Releasowania Aplikacji

### Budowanie Projektu

1. Zbuduj projekt za pomocą pnpm:
   ```bash
   pnpm build
   ```
    - Polecenie generuje zoptymalizowane pliki produkcyjne w katalogu `dist/`

### Budowanie Obrazu Docker

2. Zbuduj obraz Docker:
   ```bash
   docker build -t haduin/mieszkania-frontend: {tag} .
   ```

### Publikacja Obrazu

3. Zaloguj się do rejestru Docker (np. Docker Hub):
   ```bash
   docker login
   ```

4. Oznacz obraz tagiem repozytorium:
   ```bash
   docker tag mieszkania-frontend:v1.0.0 twoja-organizacja/mieszkania-frontend:v1.0.0
   ```

5. Wypchnij obraz do repozytorium:
   ```bash
   docker push twoja-organizacja/mieszkania-frontend:v1.0.0
   ```

### Wskazówki

- Przed releasem zawsze:
    - Zaktualizuj wersję w `package.json`
    - Sprawdź konfigurację środowiska
    - Zweryfikuj zmienne środowiskowe

### Wersjonowanie

Stosuj [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH`
- Przykład: `1.0.0`, `1.1.2`, `2.0.0`
