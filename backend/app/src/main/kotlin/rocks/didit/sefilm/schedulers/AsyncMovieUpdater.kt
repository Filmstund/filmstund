package rocks.didit.sefilm.schedulers

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.jdbi.v3.sqlobject.kotlin.attach
import org.jdbi.v3.sqlobject.kotlin.onDemand
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder
import rocks.didit.sefilm.KnownException
import rocks.didit.sefilm.clients.ImdbClient
import rocks.didit.sefilm.database.dao.MovieDao
import rocks.didit.sefilm.domain.dto.ImdbResult
import rocks.didit.sefilm.domain.dto.TmdbMovieDetails
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.domain.id.IMDbID
import rocks.didit.sefilm.domain.id.TMDbID
import rocks.didit.sefilm.domain.id.isMissing
import rocks.didit.sefilm.domain.id.isSupplied
import rocks.didit.sefilm.services.external.FilmstadenService
import java.time.Duration
import java.time.Instant
import java.util.concurrent.ThreadLocalRandom

@Component
@ConditionalOnProperty(
  prefix = "sefilm.schedulers.enabled", name = ["movieUpdater"],
  matchIfMissing = true,
  havingValue = "true"
)
class AsyncMovieUpdater(
  private val jdbi: Jdbi,
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
    val movieDao = jdbi.onDemand<MovieDao>()
    val moviesThatRequiresUpdate = movieDao
      .findByArchivedOrderByPopularityDesc()
      .filter(this::isUpdateRequired)

    if (moviesThatRequiresUpdate.isNotEmpty()) {
      log.info("Commencing scheduled update for ${moviesThatRequiresUpdate.count()} movies")
      synchronousExtendMovieInfo(moviesThatRequiresUpdate)
    }
  }

  @Async
  fun extendMovieInfo(movies: Iterable<MovieDTO>) {
    synchronousExtendMovieInfo(movies)
  }

  fun synchronousExtendMovieInfo(movies: Iterable<MovieDTO>) {
    movies.forEach { movie ->
      jdbi.useTransactionUnchecked { handle ->
        log.info("[MovieUpdater] Fetching extended info for ${movie.log()}")
        try {
          val movieDao = handle.attach<MovieDao>()
          updateInfo(movieDao, movie)
        } catch (e: Exception) {
          log.warn("[MovieUpdater] An error occurred when updating '${movie.title}' ID=${movie.id}, Filmstaden id=${movie.filmstadenId}")
          if (e !is KnownException) {
            log.warn("Exception", e)
          }
        }
      }
      waitForRandomTime()
    }
  }

  private fun waitForRandomTime(origin: Long = 3000L, bound: Long = 7000L) {
    val waitTime = ThreadLocalRandom.current().nextLong(origin, bound)
    try {
      Thread.sleep(waitTime)
    } catch (e: InterruptedException) {
      log.info("waitForRandomTime were interrupted")
      Thread.currentThread().interrupt()
    }
  }

  private fun isUpdateRequired(movie: MovieDTO) = !movie.archived && (movie.needsMoreInfo() || movie.imdbId.isMissing())

  private fun updateInfo(movieDao: MovieDao, movie: MovieDTO) {
    if (movie.needsMoreInfo()) {
      updateMovieInDb(movieDao, fetchExtendedInfoForMovie(movie))
    }
    if (movie.imdbId.isMissing()) {
      updateMovieInDb(movieDao, updateImdbIdBasedOnTitle(movie))
    }
  }

  fun updateMovieInDb(movieDao: MovieDao, movie: MovieDTO) {
    if (movieDao.updateMovie(movie) == null) {
      log.info("[DB] Wasn't able to update ${movie.log()} with last modified date ${movie.lastModifiedDate}. Maybe someone updated it before?")
    }
  }

  private fun fetchExtendedInfoForMovie(movie: MovieDTO): MovieDTO {
    return when {
      movie.filmstadenId != null -> updateFromFilmstaden(movie)
      movie.tmdbId.isSupplied() -> updateFromTmdbById(movie)
      movie.imdbId.isSupplied() -> updateFromTmdbByImdbId(movie)
      else -> updateFromImdbByTitle(movie)
    }
  }

  private fun updateFromFilmstaden(movie: MovieDTO): MovieDTO {
    log.info("[Filmstaden] Fetching extended info from Filmstaden for ${movie.log()} and filmstadenId: ${movie.filmstadenId}")
    val updatedMovie = filmstadenClient.fetchExtendedInfo(movie.filmstadenId!!)
    if (updatedMovie == null) {
      log.info("[Filmstaden] ${movie.log()} not found. Removing that Filmstaden id...")
      return movie.copy(filmstadenId = null)
    }

    val copy = movie.copy(
      synopsis = updatedMovie.shortDescription,
      slug = updatedMovie.slug,
      originalTitle = updatedMovie.originalTitle,
      releaseDate = updatedMovie.releaseDate ?: movie.releaseDate,
      productionYear = updatedMovie.productionYear,
      runtime = Duration.ofMinutes(updatedMovie.length ?: 0L),
      poster = setWidthTo240(updatedMovie.posterUrl),
      genres = updatedMovie.genres?.map { g -> g.name }?.toMutableSet() ?: mutableSetOf()
    )

    if (copy.needsMoreInfo()) {
      log.info("[Filmstaden] Updated ${copy.log()} with Filmstaden data, but not all info were available")
    } else {
      log.info("[Filmstaden] Successfully updated ${copy.log()} with Filmstaden data")
    }
    return copy
  }

  /** The width query parameter on the poster url sometimes causes 403 errors if too large. */
  private fun setWidthTo240(url: String?): String? {
    if (url == null) return null
    return UriComponentsBuilder.fromUriString(url)
      .replaceQueryParam("width", 240)
      .toUriString()
  }

  private fun updateFromTmdbById(movie: MovieDTO): MovieDTO {
    if (!movie.tmdbId.isSupplied()) {
      log.info("[TMDb] ${movie.log()} is missing an TMDb ID. TMDb ID state: ${movie.tmdbId?.state}")
      return movie
    }

    log.info("[TMDb] Fetching movie details by TMDb ID=${movie.tmdbId}")
    val movieDetails = imdbClient.movieDetailsExact(movie.tmdbId!!)
    return movie.copyDetails(movieDetails)
  }

  private fun updateFromTmdbByImdbId(movie: MovieDTO): MovieDTO {
    if (!movie.imdbId.isSupplied()) {
      log.info("[TMDb] The IMDb ID for ${movie.log()} is not supplied")
      return movie
    }

    log.info("[TMDb] Fetching movie details by IMDb ID=${movie.imdbId}")
    val movieDetails = imdbClient.movieDetails(movie.imdbId!!)
    return movie.copyDetails(movieDetails)
  }

  private fun updateFromImdbByTitle(movie: MovieDTO): MovieDTO {
    log.info("[IMDb] Update movie defaults for title=${movie.title}")
    val imdbId = getFirstImdbIdMatchingTitle(movie.title, movie.productionYear)

    if (imdbId.isUnknown()) {
      log.warn("[IMDb] Didn't find an IMDb matching title '${movie.title}'")
      return movie.copy(imdbId = imdbId)
    }
    log.info("[IMDb] Using IMDb ID=$imdbId")
    return updateFromTmdbByImdbId(movie.copy(imdbId = imdbId))
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

  private fun updateImdbIdBasedOnTitle(movie: MovieDTO): MovieDTO {
    log.info("[IMDb] Update IMDb ID based on title=${movie.title}")
    val imdbId = getFirstImdbIdMatchingTitle(movie.title, movie.productionYear)
    log.info("[IMDb] ${movie.title} ⟶ $imdbId")
    return movie.copy(imdbId = imdbId)
  }

  private fun MovieDTO.copyDetails(movieDetails: TmdbMovieDetails): MovieDTO {
    return this.copy(
      title = movieDetails.title,
      originalTitle = movieDetails.original_title,
      synopsis = movieDetails.overview,
      productionYear = movieDetails.release_date?.year,
      genres = movieDetails.genres.map { it.name }.toSet(),
      poster = movieDetails.fullPosterPath(),
      tmdbId = TMDbID.valueOf(movieDetails.id),
      popularity = movieDetails.popularity,
      popularityLastUpdated = Instant.now(),
      imdbId = IMDbID.valueOf(movieDetails.imdb_id)
    )
  }

  private fun MovieDTO.log() = "'${this.title}' (${this.id})"
}