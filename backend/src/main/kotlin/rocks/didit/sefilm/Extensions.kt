package rocks.didit.sefilm

import org.springframework.security.core.context.SecurityContextHolder

fun currentLoggedInUserId(): String {
    val principal = SecurityContextHolder.getContext().authentication.principal as OpenIdConnectUserDetails
    return principal.userId
}
