package rocks.didit.sefilm

import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.TMDbID
import rocks.didit.sefilm.domain.UserID

internal fun currentLoggedInUser(): UserID {
  val authentication: Authentication? = SecurityContextHolder.getContext().authentication
  if (authentication?.isAuthenticated != true) {
    throw IllegalStateException("Cannot get current user if user isn't authenticated")
  }

  val principal = authentication.principal as OpenIdConnectUserDetails
  return UserID(principal.userId)
}

internal fun String.toImdbId() = IMDbID.valueOf(this)
internal fun Long.toTmdbId() = TMDbID.valueOf(this)

inline fun <reified T, E : Throwable> T?.orElseThrow(exceptionSupplier: () -> E): T = this ?: throw exceptionSupplier()
