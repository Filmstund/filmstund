package rocks.didit.sefilm

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.common.OAuth2AccessToken
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.SfExtendedMovieDTO
import rocks.didit.sefilm.domain.dto.TmdbMovieDetails
import java.time.Duration
import java.time.Instant

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
    title = this.title,
    poster = this.posterUrl,
    releaseDate = this.releaseDate,
    originalTitle = this.originalTitle,
    genres = this.genres.map { (name) -> name },
    runtime = Duration.ofMinutes(this.length),
    productionYear = this.productionYear,
    synopsis = this.shortDescription)

internal fun TmdbMovieDetails.toMovie() =
  Movie(
    imdbId = IMDbID.valueOf(this.imdb_id),
    tmdbId = TMDbID.valueOf(this.id),
    title = this.title,
    poster = this.fullPosterPath(),
    releaseDate = this.release_date,
    originalTitle = this.original_title,
    genres = this.genres.map { it.name },
    productionYear = this.release_date.year,
    synopsis = this.overview,
    runtime = Duration.ofMinutes(this.runtime?.toLong() ?: 0),
    popularity = this.popularity,
    popularityLastUpdated = Instant.now()
  )

internal fun User.toLimitedUserInfo(): LimitedUserInfo {
  return LimitedUserInfo(this.id, this.name, this.firstName, this.lastName, this.nick, this.phone?.number, this.avatar)
}

internal fun String.toImdbId() = IMDbID.valueOf(this)
internal fun Long.toTmdbId() = TMDbID.valueOf(this)


internal fun Participant.toLimitedParticipant(): Participant {
  val userId = currentLoggedInUser()
  return when(this) {
    is PaymentParticipant -> when(this.payment.type) {
      PaymentType.Swish -> this
      PaymentType.Företagsbiljett -> if (this.userID == userId) this else LimitedParticipant(this.userID)
      PaymentType.Other -> this
    }
    else -> this
  }
}

internal fun Showing.withoutSensitiveFields(): Showing {
  return this.copy(participants = participants.map{p -> p.toLimitedParticipant()}.toSet())
}
