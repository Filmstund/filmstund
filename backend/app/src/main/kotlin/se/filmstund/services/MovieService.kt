package se.filmstund.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.withExtensionUnchecked
import org.springframework.stereotype.Service
import se.filmstund.NotFoundException
import se.filmstund.database.dao.MovieDao
import se.filmstund.domain.dto.FilmstadenGenreDTO
import se.filmstund.domain.dto.core.MovieDTO
import se.filmstund.domain.id.FilmstadenNcgID
import se.filmstund.domain.id.MovieID
import se.filmstund.logger
import se.filmstund.schedulers.AsyncMovieUpdater
import se.filmstund.services.external.FilmstadenService
import se.filmstund.utils.MovieFilterUtil
import java.time.Duration

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

  fun getMovie(movieId: MovieID?): MovieDTO? = movieId?.let(onDemandMovieDao::findById)

  fun getMovieOrThrow(movieId: MovieID?): MovieDTO = getMovie(movieId) ?: throw NotFoundException("movie with id: $movieId")

  /** Fetch new movies from Filmstaden, and trigger an async background update of the movies when done */
  fun fetchNewMoviesFromFilmstaden(): List<MovieDTO> {
    val filmstadenMovies = filmstadenService.allMovies()

    return jdbi.withExtensionUnchecked(MovieDao::class) { movieDao ->
      
    val newMoviesWeHaventPreviouslySeen = filmstadenMovies
      .filter { fsMovie ->
        filterUtil.isNewerThan(fsMovie)
          && !filterUtil.isMovieUnwantedBasedOnGenre(fsMovie.genres.map(FilmstadenGenreDTO::name))
          && !filterUtil.isTitleUnwanted(fsMovie.title)
          && !movieDao.existsByFilmstadenId(FilmstadenNcgID(fsMovie.ncgId))
      }
      .map {
        MovieDTO(
          id = MovieID.random(),
          title = filterUtil.trimTitle(it.title),
          releaseDate = it.releaseDate,
          poster = it.posterUrl,
          slug = it.slug,
          runtime = Duration.ofMinutes(it.length?.toLong() ?: 0L),
          filmstadenId = FilmstadenNcgID(it.ncgId),
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
