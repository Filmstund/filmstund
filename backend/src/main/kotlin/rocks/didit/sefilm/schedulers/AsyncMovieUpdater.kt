package rocks.didit.sefilm.schedulers

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.clients.ImdbClient
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.TMDbID
import rocks.didit.sefilm.domain.dto.ImdbResult
import rocks.didit.sefilm.domain.dto.TmdbMovieDetails
import rocks.didit.sefilm.services.external.FilmstadenService
import java.time.Duration
import java.time.Instant
import java.util.*

@Component
@ConditionalOnProperty(
        prefix = "sefilm.schedulers.enabled", name = ["movieUpdater"],
        matchIfMissing = true,
        havingValue = "true"
)
class AsyncMovieUpdater(
        private val movieRepository: MovieRepository,
        private val filmstadenClient: FilmstadenService,
        private val imdbClient: ImdbClient
) {

    companion object {
        private const val INITIAL_UPDATE_DELAY = 5 * 60 * 1000L
        private const val UPDATE_INTERVAL = 43200000L // 12 hours
    }

    private val log = LoggerFactory.getLogger(AsyncMovieUpdater::class.java)

    @Scheduled(initialDelay = INITIAL_UPDATE_DELAY, fixedDelay = UPDATE_INTERVAL)
    fun scheduledMovieUpdates() {
        val moviesThatRequiresUpdate = movieRepository
                .findByArchivedOrderByPopularityDesc()
                .filter(this::isUpdateRequired)
        if (moviesThatRequiresUpdate.isNotEmpty()) {
            log.info("Commencing scheduled update for ${moviesThatRequiresUpdate.count()} movies")
            synchronousExtendMovieInfo(moviesThatRequiresUpdate)
        }
    }

    @Async
    fun extendMovieInfo(movies: Iterable<Movie>) {
        synchronousExtendMovieInfo(movies)
    }

    fun synchronousExtendMovieInfo(movies: Iterable<Movie>) {
        movies.forEach {
            log.info("[MovieUpdater] Fetching extended info for ${it.log()}")
            try {
                updateInfo(it)
            } catch (e: Exception) {
                log.warn("[MovieUpdater] An error occurred when updating '${it.title}' ID=${it.id}, Filmstaden id=${it.filmstadenId}", e)
            }
            randomBackoff()
        }
    }

    private fun randomBackoff() {
        val waitTime = 3000L + Random().nextInt(7000)
        try {
            Thread.sleep(waitTime)
        } catch (e: InterruptedException) {
            log.info("randomBackoff were interrupted")
            Thread.currentThread().interrupt()
        }
    }

    private fun isUpdateRequired(movie: Movie) = !movie.archived && (movie.needsMoreInfo() || movie.imdbId.isMissing())

    private fun updateInfo(movie: Movie) {
        if (movie.needsMoreInfo()) {
            fetchExtendedInfoForMovie(movie)
        }
        if (movie.imdbId.isMissing()) {
            updateImdbIdBasedOnTitle(movie)
        }
    }

    private fun fetchExtendedInfoForMovie(movie: Movie) {
        when {
            movie.filmstadenId != null -> updateFromFilmstaden(movie)
            movie.tmdbId.isSupplied() -> updateFromTmdbById(movie)
            movie.imdbId.isSupplied() -> updateFromTmdbByImdbId(movie)
            else -> updateFromImdbByTitle(movie)
        }
    }

    private fun updateFromFilmstaden(movie: Movie): Movie {
        log.info("[Filmstaden] Fetching extended info from Filmstaden for ${movie.log()} and filmstadenId: ${movie.filmstadenId}")
        val updatedMovie = filmstadenClient.fetchExtendedInfo(movie.filmstadenId!!)
        if (updatedMovie == null) {
            log.info("[Filmstaden] ${movie.log()} not found. Removing that Filmstaden id...")
            return movieRepository.save(movie.copy(filmstadenId = null))
        }

        val copy = movie.copy(synopsis = updatedMovie.shortDescription,
                filmstadenSlug = updatedMovie.slug,
                originalTitle = updatedMovie.originalTitle,
                releaseDate = updatedMovie.releaseDate ?: movie.releaseDate,
                productionYear = updatedMovie.productionYear,
                runtime = Duration.ofMinutes(updatedMovie.length ?: 0L),
                poster = setWidthTo240(updatedMovie.posterUrl),
                genres = updatedMovie.genres?.map { it.name } ?: listOf())

        val saved = movieRepository.save(copy)
        if (saved.needsMoreInfo()) {
            log.info("[Filmstaden] Updated ${movie.log()} with Filmstaden data, but not all info were available")
        } else {
            log.info("[Filmstaden] Successfully updated ${movie.log()} with Filmstaden data")
        }
        return saved
    }

    /** The width query parameter on the poster url sometimes causes 403 errors if too large. */
    private fun setWidthTo240(url: String?): String? {
        if (url == null) return null
        val toUriString = UriComponentsBuilder.fromUriString(url)
                .replaceQueryParam("width", 240)
                .toUriString()
        return toUriString
    }

    private fun updateFromTmdbById(movie: Movie) {
        if (movie.tmdbId.isNotSupplied()) {
            log.info("[TMDb] ${movie.log()} is missing an TMDb ID. TMDb ID state: ${movie.tmdbId.state}")
            return
        }

        log.info("[TMDb] Fetching movie details by TMDb ID=${movie.tmdbId}")
        val movieDetails = imdbClient.movieDetailsExact(movie.tmdbId)
        movieRepository.save(movie.copyDetails(movieDetails))
    }

    private fun updateFromTmdbByImdbId(movie: Movie) {
        if (movie.imdbId.isNotSupplied()) {
            log.info("[TMDb] The IMDb ID for ${movie.log()} is not supplied")
            return
        }

        log.info("[TMDb] Fetching movie details by IMDb ID=${movie.imdbId}")
        val movieDetails = imdbClient.movieDetails(movie.imdbId)
        val updatedMovie = movie.copyDetails(movieDetails)
        movieRepository.save(updatedMovie)
    }

    private fun updateFromImdbByTitle(movie: Movie) {
        log.info("[IMDb] Update movie defaults for title=${movie.title}")
        val imdbId = getFirstImdbIdMatchingTitle(movie.title, movie.productionYear)

        if (imdbId.isUnknown()) {
            log.warn("[IMDb] Didn't find an IMDb matching title '${movie.title}'")
            movieRepository.save(movie.copy(imdbId = imdbId))
            return
        }
        log.info("[IMDb] Using IMDb ID=$imdbId")
        updateFromImdbByTitle(movie.copy(imdbId = imdbId))
    }

    /** Returns a Supplied IMDbID from the best match or IMDbID.UNKNOWN if nothing were found */
    private fun getFirstImdbIdMatchingTitle(title: String, year: Int?): IMDbID {
        log.info("[IMDb] Fetching movie details by title='$title'")
        val searchResults = imdbClient.search(title)
        if (searchResults.isEmpty()) {
            log.warn("[IMDb] No movies found matching '$title'. Nothing to update")
            return IMDbID.UNKNOWN
        }
        var firstResult = searchResults.firstOrNull {
            it.matchesTitleAndYear(title, year)
        }

        if (firstResult == null) {
            log.warn("[IMDb] No search result exactly matching '$title' and year=$year")
            firstResult = searchResults[0]
        }
        log.info("[IMDb] Found ${searchResults.size} results matching $title. Choosing ${firstResult.l} (${firstResult.id})")
        return IMDbID.valueOf(firstResult.id)
    }

    private fun ImdbResult.matchesTitleAndYear(title: String, year: Int?): Boolean {
        if (year == null) {
            return this.l == title
        }
        return this.y == year && this.l == title
    }

    private fun updateImdbIdBasedOnTitle(movie: Movie) {
        log.info("[IMDb] Update IMDb ID based on title=${movie.title}")
        val imdbId = getFirstImdbIdMatchingTitle(movie.title, movie.productionYear)
        log.info("[IMDb] ${movie.title} ⟶ $imdbId")
        val updatedMovie = movie.copy(imdbId = imdbId)
        movieRepository.save(updatedMovie)
    }

    private fun Movie.copyDetails(movieDetails: TmdbMovieDetails): Movie {
        return this.copy(
                title = movieDetails.title,
                originalTitle = movieDetails.original_title,
                synopsis = movieDetails.overview,
                productionYear = movieDetails.release_date?.year,
                genres = movieDetails.genres.map { it.name },
                poster = movieDetails.fullPosterPath(),
                tmdbId = TMDbID.valueOf(movieDetails.id),
                popularity = movieDetails.popularity,
                popularityLastUpdated = Instant.now(),
                imdbId = IMDbID.valueOf(movieDetails.imdb_id)
        )
    }

    private fun Movie.log() = "'${this.title}' (${this.id})"
}