package rocks.didit.sefilm.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.withExtensionUnchecked
import org.springframework.stereotype.Service
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.dao.MovieDao
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.logger
import rocks.didit.sefilm.schedulers.AsyncMovieUpdater
import rocks.didit.sefilm.services.external.FilmstadenService
import rocks.didit.sefilm.utils.MovieFilterUtil
import java.time.Duration
import java.util.*

@Service
class MovieService(
  private val jdbi: Jdbi,
  private val onDemandMovieDao: MovieDao,
  private val filmstadenService: FilmstadenService,
  private val filterUtil: MovieFilterUtil,
  private val asyncMovieUpdater: AsyncMovieUpdater?
) {

  private val log by logger()

  /** All movies that aren't archived */
  fun allMovies() = onDemandMovieDao.findByArchivedOrderByPopularityDesc(false)

  fun archivedMovies() = onDemandMovieDao.findByArchivedOrderByPopularityDesc(true)

  fun getMovie(movieId: UUID?): MovieDTO? = movieId?.let(onDemandMovieDao::findById)

  fun getMovieOrThrow(movieId: UUID?): MovieDTO = getMovie(movieId) ?: throw NotFoundException("movie with id: $movieId")

  /** Fetch new movies from Filmstaden, and trigger an async background update of the movies when done */
  fun fetchNewMoviesFromFilmstaden(): List<MovieDTO> {
    val filmstadenMovies = filmstadenService.allMovies()

    return jdbi.withExtensionUnchecked(MovieDao::class) { movieDao ->
      
    val newMoviesWeHaventPreviouslySeen = filmstadenMovies
      .filter {
        filterUtil.isNewerThan(it)
          && !filterUtil.isMovieUnwantedBasedOnGenre(it.genres.map { g -> g.name })
          && !filterUtil.isTitleUnwanted(it.title)
          && movieDao.existsByFilmstadenId(it.ncgId)
      }
      .map {
        MovieDTO(
          id = UUID.randomUUID(),
          title = filterUtil.trimTitle(it.title),
          releaseDate = it.releaseDate,
          poster = it.posterUrl,
          slug = it.slug,
          runtime = Duration.ofMinutes(it.length?.toLong() ?: 0L),
          filmstadenId = it.ncgId,
          genres = it.genres.map { g -> g.name }.toSet()
        )
      }

    val savedEntitiesCount = movieDao.insertMovies(newMoviesWeHaventPreviouslySeen).sum()
    log.info("Saved $savedEntitiesCount new movies from Filmstaden")

    asyncMovieUpdater?.extendMovieInfo(newMoviesWeHaventPreviouslySeen)
    newMoviesWeHaventPreviouslySeen.sortedBy { it.releaseDate }
    }
  }
}
