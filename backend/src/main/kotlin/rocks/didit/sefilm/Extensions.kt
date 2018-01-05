package rocks.didit.sefilm

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.common.OAuth2AccessToken
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.*

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

internal fun Participant.redact(): RedactedParticipant {
  return when (this) {
    is SwishParticipant -> RedactedParticipant(this.userId, PaymentType.Swish)
    is FtgBiljettParticipant -> RedactedParticipant(this.userId, PaymentType.Foretagsbiljett)
    is RedactedParticipant -> this
  }
}

internal fun Showing.withoutSensitiveFields(): Showing {
  return this.copy(participants = participants.map(Participant::redact).toSet())
}

inline fun <reified T, E : Throwable> T?.orElseThrow(exceptionSupplier: () -> E): T = this ?: throw exceptionSupplier()
