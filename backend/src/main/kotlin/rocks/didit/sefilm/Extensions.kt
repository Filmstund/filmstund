package rocks.didit.sefilm

import org.springframework.security.core.context.SecurityContextHolder
import rocks.didit.sefilm.database.entities.Showing

fun currentLoggedInUserId(): String {
    val principal = SecurityContextHolder.getContext().authentication.principal as OpenIdConnectUserDetails
    return principal.userId
}

fun Showing.isLoggedInUserAdmin(): Boolean {
    return this.admin?.id == currentLoggedInUserId()
}
