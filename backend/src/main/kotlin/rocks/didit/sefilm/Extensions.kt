package rocks.didit.sefilm

import org.springframework.security.core.context.SecurityContextHolder
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.UserID

fun currentLoggedInUser(): UserID {
    val principal = SecurityContextHolder.getContext().authentication.principal as OpenIdConnectUserDetails
    return UserID(principal.userId)
}

fun Showing.isLoggedInUserAdmin(): Boolean {
    return this.admin == currentLoggedInUser()
}
