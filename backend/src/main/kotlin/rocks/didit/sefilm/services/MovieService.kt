package rocks.didit.sefilm.services

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.orElseThrow
import rocks.didit.sefilm.schedulers.AsyncMovieUpdater
import rocks.didit.sefilm.services.external.FilmstadenService
import rocks.didit.sefilm.utils.MovieFilterUtil
import java.time.Duration
import java.util.*

@Service
class MovieService(
  private val movieRepo: MovieRepository,
  private val filmstadenService: FilmstadenService,
  private val filterUtil: MovieFilterUtil,
  private val asyncMovieUpdater: AsyncMovieUpdater?
) {

  companion object {
    private val log: Logger = LoggerFactory.getLogger(MovieService::class.java)
  }

  /** All movies that aren't archived */
  fun allMovies() = movieRepo.findByArchivedOrderByPopularityDesc(false)

  fun archivedMovies() = movieRepo.findByArchivedOrderByPopularityDesc(true)

  fun getMovie(movieId: UUID?): Movie? = movieId?.let { movieRepo.findById(it).orElse(null) }

  fun getMovieOrThrow(movieId: UUID?): Movie =
    getMovie(movieId).orElseThrow { NotFoundException("movie with id: $movieId") }

  /** Fetch new movies from Filmstaden, and trigger an async background update of the movies when done */
  @Transactional
  fun fetchNewMoviesFromFilmstaden(): List<Movie> {
    val filmstadenMovies = filmstadenService.allMovies()

    val newMoviesWeHaventPreviouslySeen = filmstadenMovies
      .filter {
        filterUtil.isNewerThan(it)
          && !filterUtil.isMovieUnwantedBasedOnGenre(it.genres.map { g -> g.name })
          && !filterUtil.isTitleUnwanted(it.title)
          && movieRepo.existsByFilmstadenId(FilmstadenMembershipId(it.ncgId))
      }
      .map {
        Movie(
          title = filterUtil.trimTitle(it.title),
          releaseDate = it.releaseDate,
          poster = it.posterUrl,
          slug = it.slug,
          runtime = Duration.ofMinutes(it.length?.toLong() ?: 0L),
          filmstadenId = it.ncgId,
          genres = it.genres.map { g -> g.name }.toMutableSet()
        )
      }

    val savedEntities = movieRepo.saveAll(newMoviesWeHaventPreviouslySeen)
    log.info("Fetched ${savedEntities.count()} new movies from Filmstaden")

    asyncMovieUpdater?.extendMovieInfo(savedEntities)
    return savedEntities // FIXME: -> MovieDTO
      .sortedBy { it.releaseDate }
  }
}
