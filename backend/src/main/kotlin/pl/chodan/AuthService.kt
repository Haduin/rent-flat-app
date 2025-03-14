package pl.chodan

import io.ktor.client.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

private val client = HttpClient {

}


suspend fun login(username: String, password: String): String? {
    val response: HttpResponse =
        client.post("http://localhost:8081/realms/mieszkania_realm/protocol/openid-connect/token") {
            contentType(ContentType.Application.FormUrlEncoded)
            setBody(
                listOf(
                    "client_id" to "mieszkanie_client_id",
                    "grant_type" to "password",
                    "username" to username,
                    "password" to password
                ).formUrlEncode()
            )
        }

    val responseText = response.bodyAsText() // Debugowanie
    println("🔍 Odpowiedź Keycloak: $responseText") // Podgląd odpowiedzi

    return if (response.status == HttpStatusCode.OK) {
        val tokenResponse = Json.decodeFromString<TokenResponse>(responseText)
        tokenResponse.accessToken
    } else {
        println("❌ Błąd logowania: ${response.status}")
        null
    }
}

@Serializable
data class TokenResponse(
    @SerialName("access_token") val accessToken: String,
    @SerialName("expires_in") val expiresIn: Int,
    @SerialName("refresh_expires_in") val refreshExpiresIn: Int? = null,
    @SerialName("refresh_token") val refreshToken: String? = null,
    @SerialName("token_type") val tokenType: String,
    @SerialName("id_token") val idToken: String? = null,
    @SerialName("session_state") val sessionState: String? = null,
    @SerialName("scope") val scope: String? = null,
    @SerialName("not-before-policy") val notBeforePolicy: Int? = null
    // dodaj inne pola, które mogą wystąpić w odpowiedzi
)
