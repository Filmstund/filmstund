package rocks.didit.sefilm

import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.TMDbID
import rocks.didit.sefilm.domain.dto.PublicUserDTO

internal fun currentLoggedInUser(): PublicUserDTO {
  val authentication: Authentication? = SecurityContextHolder.getContext().authentication
  check(authentication == null || authentication.isAuthenticated) { "Cannot get current user if user isn't authenticated" }

  return authentication?.principal as PublicUserDTO
}

internal fun String.toImdbId() = IMDbID.valueOf(this)
internal fun Long.toTmdbId() = TMDbID.valueOf(this)

inline fun <reified T, E : Throwable> T?.orElseThrow(exceptionSupplier: () -> E): T = this ?: throw exceptionSupplier()

internal fun <T : Any> T.logger() = lazy { LoggerFactory.getLogger(this::class.java) }
