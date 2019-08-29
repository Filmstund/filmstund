package rocks.didit.sefilm.schedulers

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.services.external.FilmstadenService
import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime

@Component
@ConditionalOnProperty(
  prefix = "sefilm.schedulers.enabled", name = ["archiver"],
  matchIfMissing = true,
  havingValue = "true"
)
class ScheduledArchiver(
  private val movieRepository: MovieRepository,
  showingRepository: ShowingRepository,
  filmstadenClient: FilmstadenService
) {

  companion object {
    private const val INITIAL_UPDATE_DELAY = 60 * 60 * 1000L // 1 hour
    private const val UPDATE_INTERVAL = 604800000L // 1 week
  }

  private val log = LoggerFactory.getLogger(ScheduledArchiver::class.java)
  private val archiveRules: List<ArchiveRule> = listOf(ReleaseDateAndShowingsRule(showingRepository, filmstadenClient))

  @Scheduled(initialDelay = INITIAL_UPDATE_DELAY, fixedDelay = UPDATE_INTERVAL)
  fun scheduledArchivations() {
    val archivableMovies = movieRepository.findAll()
      .filter { it.isScheduledForArchivation() }
    log.info("[Archiver] Found ${archivableMovies.size} movies scheduled for archivation")

    archiveMovies(archivableMovies)
  }

  private fun archiveMovies(movies: List<Movie>) {
    val prettyPrintMovies = movies.map { "{title: ${it.title}, id: ${it.id}}" }
    log.debug("[Archiver] Will archive the following movies: $prettyPrintMovies")

    val archivedMovies = movies.map {
      it.copy(archived = true)
    }
    movieRepository.saveAll(archivedMovies)
  }

  private fun Movie.isScheduledForArchivation(): Boolean {
    return archiveRules
      .map { it.isEligibleForArchivation(this) }
      .all { it }
  }
}

private class ReleaseDateAndShowingsRule(
  private val showingRepository: ShowingRepository,
  private val filmstadenClient: FilmstadenService
) : ArchiveRule {

  override fun isEligibleForArchivation(movie: Movie): Boolean {
    if (movie.isOlderThan(Duration.ofDays(65))) {
      val hasActiveShowings = movie.hasActiveShowings()
      if (!hasActiveShowings) {
        return !movie.hasActiveShowingsOnFilmstaden()
      }
      return !hasActiveShowings
    }
    return false
  }

  private fun Movie.hasActiveShowings(): Boolean {
    val showingsForMovie = showingRepository.findByMovieIdOrderByDateDesc(this.id)
    return showingsForMovie.any {
      it.date?.isAfter(LocalDate.now()) ?: false
    }
  }

  private fun Movie.isOlderThan(maxAge: Duration) =
    Duration.between(this.releaseDate.atTime(0, 0), LocalDateTime.now()) > maxAge

  private fun Movie.hasActiveShowingsOnFilmstaden(): Boolean {
    if (this.filmstadenId == null) {
      return false
    }
    return filmstadenClient.getShowingDates(this.filmstadenId).isNotEmpty()
  }
}

private interface ArchiveRule {

  fun isEligibleForArchivation(movie: Movie): Boolean
}
