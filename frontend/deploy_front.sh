#!/bin/bash

TAG=${1:-latest}
IMAGE_NAME="haduin/mieszkania-frontend"
FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"

echo "🚀 Rozpoczynam proces deploymentu..."
echo "📦 Używam tagu: $TAG"

echo "🏗️  Buduję obraz Docker: $FULL_IMAGE_NAME"
if docker build -t $FULL_IMAGE_NAME .; then
    echo "✅ Zbudowano obraz pomyślnie"
else
    echo "❌ Błąd podczas budowania obrazu"
    exit 1
fi

echo "📤 Publikuję obraz: $FULL_IMAGE_NAME"
# docker info no longer prints "Username:" (Docker Desktop keeps credentials in its own store), so instead of
# guessing the login state: push with the stored credentials and log in only when Docker Hub rejects it
if ! docker push "$FULL_IMAGE_NAME"; then
    echo "🔐 Publikacja odrzucona, loguję do Docker Hub"
    if ! docker login; then
        echo "❌ Błąd logowania do Docker Hub"
        exit 1
    fi
    if ! docker push "$FULL_IMAGE_NAME"; then
        echo "❌ Błąd podczas publikacji obrazu"
        exit 1
    fi
fi
echo "✅ Opublikowano obraz pomyślnie"

echo "🎉 Deployment zakończony sukcesem!"