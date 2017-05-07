package rocks.didit.sefilm

import org.springframework.security.core.context.SecurityContextHolder
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.domain.OmdbApiMovieDTO
import rocks.didit.sefilm.domain.SfExtendedMovieDTO
import rocks.didit.sefilm.domain.UserID
import java.time.Duration
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.*

internal fun currentLoggedInUser(): UserID {
    val principal = SecurityContextHolder.getContext().authentication.principal as OpenIdConnectUserDetails
    return UserID(principal.userId)
}

internal fun Showing.isLoggedInUserAdmin(): Boolean {
    return this.admin == currentLoggedInUser()
}

internal fun SfExtendedMovieDTO.toMovie() =
        Movie(sfId = this.ncgId,
                title = this.title,
                poster = this.posterUrl,
                releaseDate = this.releaseDate,
                originalTitle = this.originalTitle,
                genres = this.genres.map { (name) -> name },
                runtime = Duration.ofMinutes(this.length),
                productionYear = this.productionYear,
                synopsis = this.shortDescription)

internal fun OmdbApiMovieDTO.toMovie(): Movie? {
    if (!this.Response.toBoolean()) return null

    val parsedRuntime = this.Runtime?.substringBefore(" ")?.toLong()
    val runtime = when (parsedRuntime) {
        null -> Duration.ZERO
        else -> Duration.ofMinutes(parsedRuntime)
    }

    val genres = when (this.Genre) {
        null -> listOf()
        else -> this.Genre.split(", ")
    }

    val releaseDate = when (this.Released) {
        null -> LocalDate.now()
        else -> LocalDate.parse(this.Released, DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.US))
    }

    return Movie(imdbId = this.imdbID,
            title = this.Title ?: "",
            synopsis = this.Plot,
            productionYear = this.Year?.toInt(),
            poster = this.Poster,
            runtime = runtime,
            genres = genres,
            releaseDate = releaseDate)
}
