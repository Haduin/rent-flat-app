#!/bin/bash

# Zmienne konfiguracyjne
KEYCLOAK_CONTAINER="keycloak"
REALM_NAME="mieszkania_realm"
CLIENT_ID="mieszkanie_client_id"
ROOT_URL="http://localhost:5173"
HOME_URL="http://localhost:5173"

VALID_REDIRECT_URIS1="http://localhost:8081/*"
VALID_REDIRECT_URIS2="http://localhost:8080/*"
VALID_REDIRECT_URIS3="http://localhost:5173/*"
VALID_POST_LOGOUT_URIS1="http://localhost:8081/*"
VALID_POST_LOGOUT_URIS2="http://localhost:8080/*"
VALID_POST_LOGOUT_URIS3="http://localhost:5173/*"

WEB_ORIGINS1="http://localhost:8080"
WEB_ORIGINS2="http://localhost:5173"
ADMIN_URL="http://localhost:8080"

USER_NAME="myuser"
USER_PASSWORD="mypassword"
USER_EMAIL="myuser@example.com"
USER_FIRST_NAME="Test"
USER_LAST_NAME="User"


# Sprawdzenie, czy kontener działa
if ! docker ps | grep -q $KEYCLOAK_CONTAINER; then
    echo "Kontener $KEYCLOAK_CONTAINER nie działa. Uruchamiam kontener..."
    docker start $KEYCLOAK_CONTAINER
    sleep 10
fi

# Logowanie do Keycloak z użyciem kcadm.sh
echo "Logowanie do Keycloak..."
docker exec -it $KEYCLOAK_CONTAINER /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password admin

# Tworzenie realm
echo "Tworzenie realm: $REALM_NAME..."
docker exec -it $KEYCLOAK_CONTAINER /opt/keycloak/bin/kcadm.sh create realms -s realm=$REALM_NAME -s enabled=true

# Dodawanie klienta
echo "Dodawanie klienta: $CLIENT_ID..."
docker exec -it $KEYCLOAK_CONTAINER /opt/keycloak/bin/kcadm.sh create clients \
  -r $REALM_NAME \
  -s clientId=$CLIENT_ID \
  -s enabled=true \
  -s publicClient=true \
  -s rootUrl=$ROOT_URL \
  -s adminUrl=$ADMIN_URL \
  -s 'redirectUris=["'$VALID_REDIRECT_URIS1'", "'$VALID_REDIRECT_URIS2'", "'$VALID_REDIRECT_URIS3'"]' \
  -s 'webOrigins=["'$WEB_ORIGINS1'", "'$WEB_ORIGINS2'"]'

# Znalezienie ID klienta
CLIENT_INTERNAL_ID=$(docker exec -it $KEYCLOAK_CONTAINER /opt/keycloak/bin/kcadm.sh get clients -r $REALM_NAME --fields id,clientId | grep -B 1 "\"$CLIENT_ID\"" | grep '"id"' | awk -F '"' '{print $4}')

# Aktualizacja klienta w celu ustawienia Valid Post Logout Redirect URIs i Home URL --- to do fixniecia bo zle paramy wpisuje
echo "Aktualizowanie klienta: $CLIENT_ID (ID: $CLIENT_INTERNAL_ID)..."
docker exec -it $KEYCLOAK_CONTAINER /opt/keycloak/bin/kcadm.sh update clients/$CLIENT_INTERNAL_ID \
  -r $REALM_NAME \
  -s 'attributes={"post.logout.redirect.uris": "'$VALID_POST_LOGOUT_URIS1' '$VALID_POST_LOGOUT_URIS2' '$VALID_POST_LOGOUT_URIS3'"}' \
  -s baseUrl=$HOME_URL

# Tworzenie użytkownika
echo "Tworzenie użytkownika: $USER_NAME..."
docker exec -it $KEYCLOAK_CONTAINER /opt/keycloak/bin/kcadm.sh create users \
  -r $REALM_NAME \
  -s username=$USER_NAME \
  -s email=$USER_EMAIL \
  -s firstName=$USER_FIRST_NAME \
  -s lastName=$USER_LAST_NAME \
  -s enabled=true

# Ustawianie hasła użytkownika
echo "Ustawianie hasła dla użytkownika: $USER_NAME..."
docker exec -it $KEYCLOAK_CONTAINER /opt/keycloak/bin/kcadm.sh set-password \
  -r $REALM_NAME \
  --username $USER_NAME \
  --new-password $USER_PASSWORD

echo "Inicjalizacja Keycloak zakończona!"
