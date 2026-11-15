package pl.chodan.error

import io.github.smiley4.ktoropenapi.DocumentedRouteSelector
import io.github.smiley4.ktoropenapi.config.RouteConfig
import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.util.*
import java.util.Collections
import java.util.WeakHashMap

// RouteConfig has no equals override, so keys are compared by identity; weak keys let finished test apps be collected.
private val declaredErrorsByRoute: MutableMap<RouteConfig, Set<ErrorCode>> =
    Collections.synchronizedMap(WeakHashMap())

internal val RoutingNodeKey = AttributeKey<RoutingNode>("pl.chodan.route")

/** Declares the domain error codes this leaf route may return: documents them in OpenAPI and allows them at runtime. */
fun RouteConfig.errors(vararg codes: ErrorCode) {
    declaredErrorsByRoute.merge(this, codes.toSet()) { old, new -> old + new }
    // smiley4 overwrites a response entry with the same status, so one entry per status lists all its codes.
    response {
        codes.groupBy { it.status }.forEach { (status, grouped) ->
            code(status) {
                description = grouped.joinToString { it.name }
                body<ApiError>()
            }
        }
    }
}

/** Codes declared on the nearest documented route; declarations on parent `route(...)` are not inherited. */
fun ApplicationCall.declaredErrors(): Set<ErrorCode> {
    var node: RoutingNode? = attributes.getOrNull(RoutingNodeKey)
    while (null != node) {
        val selector = node.selector
        if (selector is DocumentedRouteSelector) return declaredErrorsByRoute[selector.documentation].orEmpty()
        node = node.parent
    }
    return emptySet()
}
