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

echo "🔑 Sprawdzam logowanie do Docker Hub"
if ! docker info 2>/dev/null | grep "Username:" > /dev/null; then
    echo "🔐 Wymagane logowanie do Docker Hub"
    docker login
    if [ $? -ne 0 ]; then
        echo "❌ Błąd logowania do Docker Hub"
        exit 1
    fi
fi

echo "📤 Publikuję obraz: $FULL_IMAGE_NAME"
if docker push $FULL_IMAGE_NAME; then
    echo "✅ Opublikowano obraz pomyślnie"
else
    echo "❌ Błąd podczas publikacji obrazu"
    exit 1
fi

echo "🎉 Deployment zakończony sukcesem!"