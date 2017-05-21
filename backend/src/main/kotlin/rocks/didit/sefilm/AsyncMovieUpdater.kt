package rocks.didit.sefilm

import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import rocks.didit.sefilm.clients.OmdbClient
import rocks.didit.sefilm.clients.SfClient
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import java.time.Duration
import java.util.*

@Component
class AsyncMovieUpdater(private val movieRepository: MovieRepository,
                        private val sfClient: SfClient,
                        private val omdbClient: OmdbClient) {

    companion object {
        private const val INITIAL_UPDATE_DELAY = 5 * 60 * 1000L
        private const val UPDATE_INTERVAL = 120 * 60 * 1000L
    }

    private val log = LoggerFactory.getLogger(AsyncMovieUpdater::class.java)

    @Scheduled(initialDelay = INITIAL_UPDATE_DELAY, fixedDelay = UPDATE_INTERVAL)
    fun scheduledMovieUpdates() {
        val moviesThatRequiresUpdate = movieRepository
                .findAll()
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
            log.info("Fetching extended info for ${it.title} [${it.id}]")
            try {
                updateInfo(it)
            } catch(e: Exception) {
                log.warn("An error occurred when updating ${it.title} [${it.id}]", e)
            }
            randomBackoff()
        }
    }

    private fun randomBackoff() {
        val waitTime = 3000L + Random().nextInt(7000)
        try {
            Thread.sleep(waitTime)
        } catch(e: InterruptedException) {
            log.info("randomBackoff were interrupted")
        }
    }

    private fun isUpdateRequired(movie: Movie) = movie.needsMoreInfo() || movie.isMissingImdbId()

    private fun updateInfo(movie: Movie) {
        if (movie.needsMoreInfo()) {
            fetchExtendedInfoForMovie(movie)
        }
        if (movie.isMissingImdbId()) {
            updateImdbIdBasedOnTitleAndYear(movie)
        }
    }

    private fun fetchExtendedInfoForMovie(movie: Movie) {
        log.debug("Fetching extended movie.debug for ${movie.id}")
        when {
            movie.sfId != null -> updateFromSf(movie)
            movie.imdbId != null -> updateFromImdbById(movie)
            else -> updateFromImdbByTitle(movie)
        }
    }

    private fun updateFromSf(movie: Movie): Movie {
        log.debug("Fetching extended movie.debug from SF for ${movie.sfId}")
        val updatedMovie = sfClient.fetchExtendedInfo(movie.sfId!!)

        val copy = movie.copy(synopsis = updatedMovie.shortDescription,
                sfSlug = updatedMovie.slug,
                originalTitle = updatedMovie.originalTitle,
                releaseDate = updatedMovie.releaseDate,
                productionYear = updatedMovie.productionYear,
                runtime = Duration.ofMinutes(updatedMovie.length),
                poster = updatedMovie.posterUrl,
                genres = updatedMovie.genres.map { (name) -> name })

        val saved = movieRepository.save(copy)
        log.debug("Successfully updated and saved movie[${movie.id}] with SF data")
        return saved
    }

    private fun updateFromImdbById(movie: Movie) {
        log.debug("Fetching extended movie.debug from IMDb by ID for ${movie.imdbId}")
        val updatedInfo = omdbClient.fetchByImdbId(movie.imdbId!!)?.toMovie()
        if (updatedInfo == null) {
            log.warn("Unable to find movie on OMDb with for imdb id ${movie.imdbId}")
            throw ExternalProviderException()
        }

        val copy = movie.copy(synopsis = updatedInfo.synopsis, productionYear = updatedInfo.productionYear,
                poster = updatedInfo.poster, genres = updatedInfo.genres)

        movieRepository.save(copy)
        log.debug("Successfully updated movie with extended.debugrmation")
    }

    private fun updateFromImdbByTitle(movie: Movie) {
        log.warn("Fetching extended movie.debug from IMDb by title for ${movie.title} - NOT SUPPORTED YET")
    }

    private fun updateImdbIdBasedOnTitleAndYear(movie: Movie) {
        val title = movie.originalTitle ?: movie.title
        val productionYear = movie.productionYear ?: return

        log.debug("Fetching IMDb id for '$title'")
        val updatedInfo = omdbClient.fetchByTitleAndYear(title, productionYear)?.toMovie()

        if (updatedInfo == null) {
            log.info("Movie with title '$title' not found on OMDb, Setting IMDbId=N/A")
            movieRepository.save(movie.copy(imdbId = "N/A"))
            return
        }

        log.debug("Updating Imdb id to ${updatedInfo.imdbId} for movie[id=${movie.id}]")
        val copy = movie.copy(imdbId = updatedInfo.imdbId)

        movieRepository.save(copy)
        log.debug("Successfully updated movie with new IMDb id")
    }
}