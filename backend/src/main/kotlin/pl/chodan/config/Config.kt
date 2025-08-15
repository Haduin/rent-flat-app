package pl.chodan.config

data class Config(
    val ktor: KtorConfig,
    val keycloak: KeycloakConfig
)

data class KtorConfig(
    val database: DatabaseConfig,
    val cors: CorsConfig
)

data class DatabaseConfig(
    val url: String,
    val user: String,
    val password: String,
    val driver: String
)

data class CorsConfig(
    val allowedHosts: List<String>
)

data class KeycloakConfig(
    val url: String,
    val clientId: String,
    val realm: String,
    val tokenPath: String
) {
    companion object {
        const val DEFAULT_TOKEN_PATH = "protocol/openid-connect/token"
    }
}

