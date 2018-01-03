package rocks.didit.sefilm

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.common.OAuth2AccessToken
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.LimitedUserDTO
import rocks.didit.sefilm.domain.dto.SfExtendedMovieDTO
import rocks.didit.sefilm.domain.dto.TmdbMovieDetails
import java.time.Duration
import java.time.Instant
import java.time.LocalDate

internal fun currentLoggedInUser(): UserID {
  val principal = SecurityContextHolder.getContext().authentication.principal as OpenIdConnectUserDetails
  return UserID(principal.userId)
}

internal fun oauthAccessToken(): OAuth2AccessToken {
  val principal = SecurityContextHolder.getContext().authentication.principal as OpenIdConnectUserDetails
  return principal.accessToken
}

internal fun Showing.isLoggedInUserAdmin(): Boolean {
  return this.admin == currentLoggedInUser()
}

internal fun SfExtendedMovieDTO.toMovie() =
  Movie(sfId = this.ncgId,
    sfSlug = this.slug,
    title = this.title ?: "N/A",
    poster = this.posterUrl,
    releaseDate = this.releaseDate ?: LocalDate.ofEpochDay(0L),
    originalTitle = this.originalTitle,
    genres = this.genres?.map { (name) -> name } ?: listOf(),
    runtime = Duration.ofMinutes(this.length ?: 0L),
    productionYear = this.productionYear,
    synopsis = this.shortDescription)

internal fun TmdbMovieDetails.toMovie() =
  Movie(
    imdbId = IMDbID.valueOf(this.imdb_id),
    tmdbId = TMDbID.valueOf(this.id),
    title = this.title,
    poster = this.fullPosterPath(),
    releaseDate = this.release_date ?: LocalDate.ofEpochDay(0L),
    originalTitle = this.original_title,
    genres = this.genres.map { it.name },
    productionYear = this.release_date?.year,
    synopsis = this.overview,
    runtime = Duration.ofMinutes(this.runtime?.toLong() ?: 0),
    popularity = this.popularity,
    popularityLastUpdated = Instant.now()
  )

internal fun User.toLimitedUserInfo(): LimitedUserDTO {
  return LimitedUserDTO(this.id, this.name, this.firstName, this.lastName, this.nick, this.phone?.number, this.avatar)
}

internal fun String.toImdbId() = IMDbID.valueOf(this)
internal fun Long.toTmdbId() = TMDbID.valueOf(this)

internal fun Participant.redact(): RedactedParticipant {
  return when (this) {
    is SwishParticipant -> RedactedParticipant(this.userId, PaymentType.Swish)
    is FtgBiljettParticipant -> RedactedParticipant(this.userId, PaymentType.Företagsbiljett)
    is RedactedParticipant -> this
  }
}

internal fun Showing.withoutSensitiveFields(): Showing {
  return this.copy(participants = participants.map(Participant::redact).toSet())
}
