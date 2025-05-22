#!/bin/bash

CONTAINER_NAME="mieszkanie_postgres_db"

DB_USER="myuser"
DB_NAME="mydb"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POSTGRES_SCRIPTS_DIR="${SCRIPT_DIR}"

if [ ! -d "$POSTGRES_SCRIPTS_DIR" ]; then
  echo "📂 Folder z plikami SQL ($POSTGRES_SCRIPTS_DIR) nie istnieje!"
  exit 1
fi

SQL_FILES=$(find "$POSTGRES_SCRIPTS_DIR" -type f -name "*.sql" | sort)

if [ -z "$SQL_FILES" ]; then
  echo "❌ Brak plików SQL w folderze $POSTGRES_SCRIPTS_DIR!"
  exit 1
fi

echo "✅ Rozpoczynanie wykonywania plików SQL w kontenerze $CONTAINER_NAME..."

for FILE in $SQL_FILES; do
  echo "📄 Wykonywanie pliku: $FILE"

  docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$FILE"

  if [ $? -ne 0 ]; then
    echo "❌ Wystąpił błąd podczas wykonywania pliku: $FILE"
    exit 1
  fi

  echo "✅ Wykonano pomyślnie: $FILE"
done

echo "🎉 Wszystkie pliki SQL zostały pomyślnie wykonane!"
