package rocks.didit.sefilm

import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.common.OAuth2AccessToken
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.TMDbID
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.services.UserService

internal fun currentLoggedInUser(): UserID {
  val principal = SecurityContextHolder.getContext().authentication.principal as OpenIdConnectUserDetails
  return UserID(principal.userId)
}

internal fun oauthAccessToken(): OAuth2AccessToken {
  val principal = SecurityContextHolder.getContext().authentication.principal as OpenIdConnectUserDetails
  return principal.accessToken
}

internal fun String.toImdbId() = IMDbID.valueOf(this)
internal fun Long.toTmdbId() = TMDbID.valueOf(this)

inline fun <reified T, E : Throwable> T?.orElseThrow(exceptionSupplier: () -> E): T = this ?: throw exceptionSupplier()

internal fun UserID.lookupUsing(userService: UserService): User {
  return userService.getCompleteUser(this).orElseThrow { NotFoundException("user", userID = this) }
}

internal fun <T : Any> T.logger() = lazy { LoggerFactory.getLogger(this::class.java) }
