package rocks.didit.sefilm.schedulers

import org.jdbi.v3.core.Handle
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.jdbi.v3.sqlobject.kotlin.attach
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.dao.MovieDao
import rocks.didit.sefilm.database.dao.ShowingDao
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.logger
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
  private val jdbi: Jdbi,
  filmstadenService: FilmstadenService
) {

  companion object {
    private const val INITIAL_UPDATE_DELAY = 60 * 60 * 1000L // 1 hour
    private const val UPDATE_INTERVAL = 604800000L // 1 week
  }

  private val log by logger()
  private val archiveRules: List<ArchiveRule> = listOf(ReleaseDateAndShowingsRule(filmstadenService))

  @Scheduled(initialDelay = INITIAL_UPDATE_DELAY, fixedDelay = UPDATE_INTERVAL)
  fun scheduledArchivations() {
    jdbi.useTransactionUnchecked { handle ->
      val movieDao = handle.attach<MovieDao>()
      val archivableMovies = movieDao.findByArchivedOrderByPopularityDesc(false)
        .filter { it.isScheduledForArchivation(handle) }
      log.info("[Archiver] Found ${archivableMovies.size} movies scheduled for archivation")

      archiveMovies(movieDao, archivableMovies)
    }
  }

  private fun archiveMovies(movieDao: MovieDao, movies: List<MovieDTO>) {
    if (log.isDebugEnabled) {
      val prettyPrintMovies = movies.map { "{title: ${it.title}, id: ${it.id}}\n" }
      log.debug("[Archiver] Will archive the following movies: {}", prettyPrintMovies)
    }

    val archiveMovieIds = movies.map(MovieDTO::id)
    val archiveMovieCount = movieDao.archiveMovies(archiveMovieIds)
    log.info("Successfully archived {} movies", archiveMovieCount)
  }

  private fun MovieDTO.isScheduledForArchivation(handle: Handle): Boolean {
    return archiveRules
      .map { it.isEligibleForArchivation(handle, this) }
      .all { it }
  }
}

private class ReleaseDateAndShowingsRule(private val filmstadenService: FilmstadenService) : ArchiveRule {

  override fun isEligibleForArchivation(handle: Handle, movie: MovieDTO): Boolean {
    if (movie.isOlderThan(Duration.ofDays(65))) {
      val hasActiveShowings = movie.hasActiveShowings(handle)
      if (!hasActiveShowings) {
        return !movie.hasActiveShowingsOnFilmstaden()
      }
      return !hasActiveShowings
    }
    return false
  }

  private fun MovieDTO.hasActiveShowings(handle: Handle): Boolean {
    val showingsForMovie = handle.attach<ShowingDao>().findByMovieIdOrderByDateDesc(this.id)
    val now = LocalDate.now()
    return showingsForMovie.any { showing ->
      showing.date.isAfter(now)
    }
  }

  private fun MovieDTO.isOlderThan(maxAge: Duration) =
    Duration.between(this.releaseDate.atTime(0, 0), LocalDateTime.now()) > maxAge

  private fun MovieDTO.hasActiveShowingsOnFilmstaden(): Boolean {
    if (this.filmstadenId == null) {
      return false
    }
    return filmstadenService.getShowingDates(this.filmstadenId!!).isNotEmpty()
  }
}

private interface ArchiveRule {
  fun isEligibleForArchivation(handle: Handle, movie: MovieDTO): Boolean
}
