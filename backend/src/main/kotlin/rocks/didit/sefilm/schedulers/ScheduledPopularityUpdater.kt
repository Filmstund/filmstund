package rocks.didit.sefilm.schedulers

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import rocks.didit.sefilm.ExternalProviderException
import rocks.didit.sefilm.clients.ImdbClient
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.TMDbID
import rocks.didit.sefilm.domain.dto.TmdbMovieDetails
import rocks.didit.sefilm.services.external.SFService
import rocks.didit.sefilm.toImdbId
import rocks.didit.sefilm.toTmdbId
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*

@Component
@ConditionalOnProperty(prefix = "sefilm.schedulers.enabled", name = ["popularityUpdater"], matchIfMissing = true, havingValue = "true")
class ScheduledPopularityUpdater(
  private val movieRepository: MovieRepository,
  private val sfService: SFService,
  private val imdbClient: ImdbClient) {

  companion object {
    private const val INITIAL_UPDATE_DELAY = 10L * 60 * 1000L // 10min
    private const val UPDATE_INTERVAL = 4 * 60 * 60 * 1000L // 4 hours

    private const val HAS_SF_SHOWINGS_POPULARITY = 500.0
  }

  private val log = LoggerFactory.getLogger(ScheduledPopularityUpdater::class.java)

  @Scheduled(initialDelay = INITIAL_UPDATE_DELAY, fixedDelay = UPDATE_INTERVAL)
  fun scheduledMovieUpdates() {
    val moviesWithOldPopularity = movieRepository
      .findByArchivedOrderByPopularityDesc()
      .filter(Movie::isPopularityOutdated)
    if (moviesWithOldPopularity.isNotEmpty()) {
      log.info("[Schedule] Updating popularity for ${moviesWithOldPopularity.count()} movies")
      updatePopularitys(moviesWithOldPopularity)
    }
  }

  fun updatePopularitys(movies: Iterable<Movie>) {
    movies.forEach {
      log.info("[Popularity] Updating popularity for '${it.title}' with id=${it.id}")
      try {
        updatePopularity(it)
      } catch (e: ExternalProviderException) {
        log.warn("[Popularity] Provider error: " + e.message)
        rescheduleNextPopularityUpdate(movie = it)
      } catch (e: Exception) {
        log.warn("[Popularity] An error occurred when updating popularity for '${it.title}' ID=${it.id}", e)
      }
      randomBackoff()
    }
  }

  private fun randomBackoff() {
    val waitTime = 3000L + Random().nextInt(10000)
    try {
      Thread.sleep(waitTime)
    } catch (e: InterruptedException) {
      log.info("[Popularity] randomBackoff were interrupted")
      Thread.currentThread().interrupt()
    }
  }

  private fun updatePopularity(movie: Movie) {
    val popularityAndId = when {
      movie.tmdbId.isSupplied() -> fetchPopularityByTmdbId(movie)
      movie.imdbId.isSupplied() -> fetchPopularityByImdbId(movie)
      else -> fetchPopularityByTitle(movie)
    }

    if (popularityAndId == null) {
      rescheduleNextPopularityUpdate(movie = movie)
      return
    }

    val newPopularity = when (movie.hasFutureSfShowings()) {
      true -> {
        log.info("[Popularity] ${movie.title} has future showings at SF, increasing popularity by $HAS_SF_SHOWINGS_POPULARITY")
        popularityAndId.popularity + HAS_SF_SHOWINGS_POPULARITY
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
    movieRepository.save(updatedMovie)
  }

  private fun Movie.hasFutureSfShowings(): Boolean {
    if (this.sfId == null || this.sfId.isBlank()) return false

    return sfService.getShowingDates(this.sfId).isNotEmpty()
  }

  private fun rescheduleNextPopularityUpdate(weeks: Long = 4, movie: Movie) {
    log.warn("[Popularity] No info found for movie with ${movie.title} (${movie.id}). Next check in approximately $weeks weeks")
    val updatedMovie = movie.copy(popularityLastUpdated = LocalDateTime.now().plusWeeks(weeks).toInstant(ZoneOffset.UTC))
    movieRepository.save(updatedMovie)
  }

  private fun fetchPopularityByTmdbId(movie: Movie): PopularityAndId? {
    if (movie.tmdbId.isNotSupplied()) {
      log.warn("[TMDb][Popularity] Movie[${movie.id} is missing an TMDb id")
      return null
    }

    val movieDetails = imdbClient.movieDetailsExact(movie.tmdbId)
    return PopularityAndId(movieDetails.popularity, movieDetails.id.toTmdbId(), movieDetails.imdb_id.toImdbId())
  }

  private fun fetchPopularityByImdbId(movie: Movie): PopularityAndId? {
    if (movie.imdbId.isNotSupplied()) {
      log.warn("[IMDb][Popularity] Movie[${movie.id} is missing an IMDb id")
      return null
    }

    val movieDetails: TmdbMovieDetails
    try {
      movieDetails = imdbClient.movieDetails(movie.imdbId)
    } catch (e: ExternalProviderException) {
      return null
    }
    return PopularityAndId(movieDetails.popularity, movieDetails.id.toTmdbId(), movieDetails.imdb_id.toImdbId())
  }

  private fun fetchPopularityByTitle(movie: Movie): PopularityAndId? {
    val title = movie.originalTitle ?: movie.title
    val movieResults = imdbClient.search(title)

    if (movieResults.isEmpty()) return null

    val movieDetails = imdbClient.movieDetails(movieResults[0].id.toImdbId())
    return PopularityAndId(movieDetails.popularity, movieDetails.id.toTmdbId(), movieDetails.imdb_id.toImdbId())
  }

  private data class PopularityAndId(val popularity: Double, val tmdbId: TMDbID, val imdbId: IMDbID = IMDbID.MISSING)
}