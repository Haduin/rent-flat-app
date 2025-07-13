package pl.chodan.context

data class UserDetails(
    val username: String,
    val email: String?,
    val roles: List<String>,
    val isAuthenticated: Boolean = false
)

data class KtorUserDetailsPrincipal(val userDetails: UserDetails)