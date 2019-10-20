package se.filmstund.schedulers

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.jdbi.v3.sqlobject.kotlin.attach
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import se.filmstund.ExternalProviderException
import se.filmstund.clients.ImdbClient
import se.filmstund.database.dao.MovieDao
import se.filmstund.domain.dto.TmdbMovieDetails
import se.filmstund.domain.dto.core.MovieDTO
import se.filmstund.domain.id.IMDbID
import se.filmstund.domain.id.TMDbID
import se.filmstund.domain.id.isNullOrBlank
import se.filmstund.domain.id.isSupplied
import se.filmstund.logger
import se.filmstund.services.external.FilmstadenService
import se.filmstund.toImdbId
import se.filmstund.toTmdbId
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*

@Component
@ConditionalOnProperty(
  prefix = "filmstund.schedulers.enabled", name = ["popularityUpdater"],
  matchIfMissing = true,
  havingValue = "true"
)
class ScheduledPopularityUpdater(
  private val jdbi: Jdbi,
  private val filmstadenService: FilmstadenService,
  private val imdbClient: ImdbClient
) {

  private val log by logger()

  companion object {
    private const val INITIAL_UPDATE_DELAY = 10L * 60 * 1000L // 10min
    private const val UPDATE_INTERVAL = 24 * 60 * 60 * 1000L // 24 hours

    private const val HAS_FILMSTADEN_SHOWINGS_POPULARITY = 500.0
  }

  @Scheduled(initialDelay = INITIAL_UPDATE_DELAY, fixedDelay = UPDATE_INTERVAL)
  fun scheduledMovieUpdates() {
    jdbi.useTransactionUnchecked { handle ->
      val movieDao = handle.attach<MovieDao>()

      val moviesWithOldPopularity = movieDao
        .findByArchivedOrderByPopularityDesc(false)
        .filter(MovieDTO::isPopularityOutdated)

      if (moviesWithOldPopularity.isNotEmpty()) {
        log.info("[Schedule] Updating popularity for ${moviesWithOldPopularity.count()} movies")
        updatePopularitys(movieDao, moviesWithOldPopularity)
      }
    }
  }

  fun updatePopularitys(movieDao: MovieDao, movies: Iterable<MovieDTO>) {
    movies.forEach {
      log.info("[Popularity] Updating popularity for '${it.title}' with id=${it.id}")
      try {
        updatePopularity(movieDao, it)
      } catch (e: ExternalProviderException) {
        log.warn("[Popularity] Provider error: " + e.message)
        rescheduleNextPopularityUpdate(movieDao, movie = it)
      } catch (e: Exception) {
        log.warn("[Popularity] An error occurred when updating popularity for '${it.title}' ID=${it.id}", e)
      }
      randomBackOff()
    }
  }

  private fun randomBackOff() {
    val waitTime = 3000L + Random().nextInt(10000)
    try {
      Thread.sleep(waitTime)
    } catch (e: InterruptedException) {
      log.info("[Popularity] randomBackOff were interrupted")
      Thread.currentThread().interrupt()
    }
  }

  private fun updatePopularity(movieDao: MovieDao, movie: MovieDTO) {
    val popularityAndId = when {
      movie.tmdbId.isSupplied() -> fetchPopularityByTmdbId(movie)
      movie.imdbId.isSupplied() -> fetchPopularityByImdbId(movie)
      else -> fetchPopularityByTitle(movie)
    }

    if (popularityAndId == null) {
      rescheduleNextPopularityUpdate(movieDao, movie = movie)
      return
    }

    val newPopularity = when (movie.hasFutureFilmstadenShowings()) {
      true -> {
        log.info("[Popularity] ${movie.title} has future showings at Filmstaden, increasing popularity by $HAS_FILMSTADEN_SHOWINGS_POPULARITY")
        popularityAndId.popularity + HAS_FILMSTADEN_SHOWINGS_POPULARITY
      }
      false -> popularityAndId.popularity
    }

    val updatedMovie = movie.copy(
      popularity = newPopularity,
      popularityLastUpdated = Instant.now(),
      tmdbId = popularityAndId.tmdbId,
      imdbId = popularityAndId.imdbId
    )
    log.info("[Popularity] Popularity updated from ${movie.popularity} → ${updatedMovie.popularity} for '${movie.title}'")
    movieDao.updateMovie(updatedMovie)
  }

  private fun MovieDTO.hasFutureFilmstadenShowings(): Boolean {
    if (this.filmstadenId.isNullOrBlank()) return false
    return filmstadenService.getShowingDates(this.filmstadenId!!).isNotEmpty()
  }

  private fun rescheduleNextPopularityUpdate(movieDao: MovieDao, weeks: Long = 4, movie: MovieDTO) {
    log.warn("[Popularity] No info found for movie with ${movie.title} (${movie.id}). Next check in approximately $weeks weeks")
    val updatedMovie =
      movie.copy(popularityLastUpdated = LocalDateTime.now().plusWeeks(weeks).toInstant(ZoneOffset.UTC))
    movieDao.updateMovie(updatedMovie)
  }

  private fun fetchPopularityByTmdbId(movie: MovieDTO): PopularityAndId? {
    if (!movie.tmdbId.isSupplied()) {
      log.warn("[TMDb][Popularity] Movie[${movie.id} is missing an TMDb id")
      return null
    }

    val movieDetails = imdbClient.movieDetailsExact(movie.tmdbId!!)
    return PopularityAndId(movieDetails.popularity, movieDetails.id.toTmdbId(), movieDetails.imdb_id.toImdbId())
  }

  private fun fetchPopularityByImdbId(movie: MovieDTO): PopularityAndId? {
    if (!movie.imdbId.isSupplied()) {
      log.warn("[IMDb][Popularity] Movie[${movie.id} is missing an IMDb id")
      return null
    }

    val movieDetails: TmdbMovieDetails
    try {
      movieDetails = imdbClient.movieDetails(movie.imdbId!!)
    } catch (e: ExternalProviderException) {
      return null
    }
    return PopularityAndId(movieDetails.popularity, movieDetails.id.toTmdbId(), movieDetails.imdb_id.toImdbId())
  }

  private fun fetchPopularityByTitle(movie: MovieDTO): PopularityAndId? {
    val title = movie.originalTitle ?: movie.title
    val movieResults = imdbClient.search(title)

    if (movieResults.isEmpty()) return null

    val movieDetails = imdbClient.movieDetails(movieResults[0].id.toImdbId())
    return PopularityAndId(movieDetails.popularity, movieDetails.id.toTmdbId(), movieDetails.imdb_id.toImdbId())
  }

  private data class PopularityAndId(val popularity: Double, val tmdbId: TMDbID, val imdbId: IMDbID = IMDbID.MISSING)
}
