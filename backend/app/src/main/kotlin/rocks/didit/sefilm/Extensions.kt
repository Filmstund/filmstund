package rocks.didit.sefilm

import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import rocks.didit.sefilm.domain.dto.PublicUserDTO

internal fun currentLoggedInUser(): PublicUserDTO {
  val authentication: Authentication? = SecurityContextHolder.getContext().authentication
  check(authentication == null || authentication.isAuthenticated) { "Cannot get current user if user isn't authenticated" }

  return authentication?.principal as PublicUserDTO
}
