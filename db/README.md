# Lokalne środowisko dev (docker-compose)

`docker-compose.yaml` w tym katalogu uruchamia trzy kontenery: bazę danych aplikacji, bazę danych Keycloaka i sam Keycloak.

## Dostęp

| Usługa | Adres | Login | Hasło |
|---|---|---|---|
| Backend (Ktor) | http://localhost:8080 | — | — |
| Frontend (Vite) | http://localhost:5173 | — | — |
| Postgres (aplikacja) | localhost:61500, baza `mydb` | `myuser` | `mypassword` |
| Postgres (Keycloak) | wewnętrzny, sieć `keycloak_network`, baza `mydb` | `myuser` | `mypassword` |
| Keycloak admin console | http://localhost:8081 | `admin` | `admin` |
| Aplikacja — realm `mieszkanie_realm` (login w UI) | http://localhost:5173 (przekierowuje na Keycloak) | `myuser` | `mypassword` |

Realm `mieszkanie_realm` i klient `mieszkanie_client_id` są utrwalone w wolumenie `keycloak_postgres_data` — nie ma pliku importu realm w repo, więc świeże środowisko wymaga ręcznej konfiguracji Keycloaka (realm, klient, użytkownik testowy) przed pierwszym logowaniem.

## Uruchomienie

```bash
cd db
docker compose up -d
```
