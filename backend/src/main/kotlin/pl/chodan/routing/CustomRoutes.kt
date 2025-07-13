package pl.chodan.routing

import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.routing.*
import pl.chodan.context.KtorUserDetailsPrincipal
import pl.chodan.context.UserDetails

/**
 * Extension function for Route that provides the authenticated user to a lambda.
 * This function can be used in routing to access the current user's details.
 *
 * @param block Lambda that receives the UserDetails and returns Unit
 */
fun Route.withUser(block: suspend ApplicationCall.(user: UserDetails) -> Unit) {
    authenticate("auth-jwt") {
        handle {
            val principal = call.principal<KtorUserDetailsPrincipal>()
            if (principal != null) {
                block(call, principal.userDetails)
            }
        }
    }
}
