package rocks.didit.sefilm

import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import rocks.didit.sefilm.domain.dto.PublicUserDTO

internal fun maybeCurrentLoggedInUser(): PublicUserDTO? {
  val authentication: Authentication? = SecurityContextHolder.getContext().authentication
  return if (authentication != null && authentication.isAuthenticated) {
    authentication.principal as PublicUserDTO
  } else {
    null
  }
}

internal fun currentLoggedInUser(): PublicUserDTO =
  maybeCurrentLoggedInUser() ?: throw AccessDeniedException("User nog logged in!")
