package rocks.didit.sefilm

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.common.OAuth2AccessToken
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.domain.LimitedUserInfo
import rocks.didit.sefilm.domain.UserID
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
    imdbId = this.imdb_id,
    tmdbId = this.id,
    title = this.title,
    poster = this.fullPosterPath(),
    releaseDate = this.release_date,
    originalTitle = this.original_title,
    genres = this.genres.map { it.name },
    productionYear = this.release_date.year,
    synopsis = this.overview,
    runtime = Duration.ofMinutes(this.runtime.toLong()),
    popularity = this.popularity,
    popularityLastUpdated = Instant.now()
  )

internal fun User.toLimitedUserInfo(): LimitedUserInfo {
  return LimitedUserInfo(this.id, this.name, this.firstName, this.lastName, this.nick, this.phone?.number, this.avatar)
}
