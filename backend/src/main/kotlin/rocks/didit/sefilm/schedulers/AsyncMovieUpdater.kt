package rocks.didit.sefilm.schedulers

import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import rocks.didit.sefilm.clients.ImdbClient
import rocks.didit.sefilm.clients.SfClient
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.domain.dto.ImdbResult
import rocks.didit.sefilm.domain.dto.TmdbMovieDetails
import java.time.Duration
import java.time.Instant
import java.util.*

@Component
class AsyncMovieUpdater(private val movieRepository: MovieRepository,
                        private val sfClient: SfClient,
                        private val imdbClient: ImdbClient) {

  companion object {
    private const val INITIAL_UPDATE_DELAY = 5 * 60 * 1000L
    private const val UPDATE_INTERVAL = 43200000L // 12 hours
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
      log.info("Fetching extended info for '${it.title}' with id=${it.id}")
      try {
        updateInfo(it)
      } catch(e: Exception) {
        log.warn("An error occurred when updating '${it.title}' ID=${it.id}, SF id=${it.sfId}", e)
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
      Thread.currentThread().interrupt()
    }
  }

  private fun isUpdateRequired(movie: Movie) = movie.needsMoreInfo() || (movie.isMissingImdbId() && movie.imdbId != "N/A")

  private fun updateInfo(movie: Movie) {
    if (movie.needsMoreInfo()) {
      fetchExtendedInfoForMovie(movie)
    }
    if (movie.isMissingImdbId() && movie.imdbId != "N/A") {
      updateImdbIdBasedOnTitle(movie)
    }
  }

  private fun fetchExtendedInfoForMovie(movie: Movie) {
    log.debug("Fetching extended info for movie id=${movie.id}")
    when {
      movie.sfId != null -> updateFromSf(movie)
      movie.tmdbId != null -> updateFromTmdbById(movie)
      !movie.isMissingImdbId() -> updateFromTmdbByImdbId(movie)
      else -> updateFromImdbByTitle(movie)
    }
  }

  private fun updateFromSf(movie: Movie): Movie {
    log.info("[SF] Fetching extended info by SF id=${movie.sfId}")
    val updatedMovie = sfClient.fetchExtendedInfo(movie.sfId!!)
    // TODO: if movie not found, set SF id to N/A or something

    val copy = movie.copy(synopsis = updatedMovie.shortDescription,
      sfSlug = updatedMovie.slug,
      originalTitle = updatedMovie.originalTitle,
      releaseDate = updatedMovie.releaseDate,
      productionYear = updatedMovie.productionYear,
      runtime = Duration.ofMinutes(updatedMovie.length),
      poster = updatedMovie.posterUrl,
      genres = updatedMovie.genres.map { (name) -> name })

    val saved = movieRepository.save(copy)
    log.info("[SF] Successfully updated and saved movie[${movie.id}] with SF data")
    return saved
  }

  private fun updateFromTmdbById(movie: Movie) {
    if (movie.tmdbId == null) {
      log.info("[TMDb] Movie[${movie.id} is missing an TMDb id")
      return
    }

    log.info("[TMDb] Fetching movie details by TMDb ID=${movie.tmdbId}")
    val movieDetails = imdbClient.movieDetailsExact(movie.tmdbId)
    movieRepository.save(movie.copyDetails(movieDetails))
  }

  private fun updateFromTmdbByImdbId(movie: Movie) {
    if (movie.imdbId == null) {
      log.info("[TMDb] Movie[${movie.id} is missing an IMDb id")
      return
    }

    log.info("[TMDb] Fetching movie details by IMDb ID=${movie.imdbId}")
    val movieDetails = imdbClient.movieDetails(movie.imdbId)
    val updatedMovie = movie.copyDetails(movieDetails)
    movieRepository.save(updatedMovie)
  }

  private fun updateFromImdbByTitle(movie: Movie) {
    log.info("[IMDb] Update movie defaults for title=${movie.title}")
    val imdbIdOrNA = getFirstImdbIdMatchingTitle(movie.title, movie.productionYear)

    if (imdbIdOrNA == "N/A") {
      log.warn("[IMDb] Didn't find an IMDb matching title '${movie.title}'")
      movieRepository.save(movie.copy(imdbId = imdbIdOrNA))
      return
    }
    log.info("[IMDb] Using IMDb ID=$imdbIdOrNA")
    updateFromImdbByTitle(movie.copy(imdbId = imdbIdOrNA))
  }

  /** Returns the IMDb id of the first match or "N/A" if nothing were found */
  private fun getFirstImdbIdMatchingTitle(title: String, year: Int?): String {
    log.info("[IMDb] Fetching movie details by title='$title'")
    val searchResults = imdbClient.search(title)
    if (searchResults.isEmpty()) {
      log.warn("[IMDb] No movies found matching '$title'. Nothing to update")
      return "N/A"
    }
    var firstResult = searchResults.firstOrNull {
      it.matchesTitleAndYear(title, year)
    }

    if (firstResult == null) {
      log.warn("[IMDb] No search result exactly matching '$title' and year=$year")
      firstResult = searchResults[0]
    }
    log.info("[IMDb] Found ${searchResults.size} results matching $title. Choosing ${firstResult.l} (${firstResult.id})")
    return firstResult.id
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
    log.info("[IMDb] ${movie.title} -> IMDb ID=$imdbId")
    val updatedMovie = movie.copy(imdbId = imdbId)
    movieRepository.save(updatedMovie)
  }

  private fun Movie.copyDetails(movieDetails: TmdbMovieDetails): Movie {
    return this.copy(title = movieDetails.title,
      originalTitle = movieDetails.original_title,
      synopsis = movieDetails.overview,
      productionYear = movieDetails.release_date.year,
      genres = movieDetails.genres.map { it.name },
      poster = movieDetails.fullPosterPath(),
      tmdbId = movieDetails.id,
      popularity = movieDetails.popularity,
      popularityLastUpdated = Instant.now(),
      imdbId = movieDetails.imdb_id)
  }
}