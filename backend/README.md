### Budowanie Projektu

1. Zbuduj projekt za pomocą pnpm:
   ```bash
   ./gradle clean jar
   ```
    - Polecenie generuje zoptymalizowane pliki produkcyjne w katalogu `dist/`

### Budowanie Obrazu Docker

2. Zbuduj obraz Docker:
   ```bash
   docker build -t haduin/mieszkania-backend: {tag} .
   ```

### Publikacja Obrazu

3. Zaloguj się do rejestru Docker (np. Docker Hub):
   ```bash
   docker login
   ```

4. Wypchnij obraz do repozytorium:
   ```bash
   docker push haduin/mieszkania-backend:v1.0.0
   ```
