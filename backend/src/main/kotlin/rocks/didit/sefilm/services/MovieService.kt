package rocks.didit.sefilm.services

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.orElseThrow
import rocks.didit.sefilm.schedulers.AsyncMovieUpdater
import rocks.didit.sefilm.utils.MovieTitleUtil
import java.util.*

@Component
class MovieService(
  private val movieRepo: MovieRepository,
  private val sfService: SFService,
  private val movieTitleUtil: MovieTitleUtil,
  private val asyncMovieUpdater: AsyncMovieUpdater
) {

  companion object {
    private val log: Logger = LoggerFactory.getLogger(MovieService::class.java)
  }

  /** All movies that aren't archived */
  fun allMovies() = movieRepo.findByArchivedOrderByPopularityDesc(false)

  fun archivedMovies() = movieRepo.findByArchivedOrderByPopularityDesc(true)

  fun getMovie(movieId: UUID?): Movie? {
    if (movieId == null) return null
    return movieRepo.findById(movieId).orElse(null)
  }

  fun getMovieOrThrow(movieId: UUID?): Movie = getMovie(movieId).orElseThrow { NotFoundException("movie with id: $movieId") }

  fun movieExists(movieId: UUID): Boolean = movieRepo.existsById(movieId)

  /** Fetch new movies from SF, and trigger an async background update of the movies when done */
  fun fetchNewMoviesFromSf(): List<Movie> {
    val sfMovies = sfService.allMovies()

    val ourMovies = movieRepo.findAll()
    val newMoviesWeHaventPreviouslySeen = sfMovies
      .filter { (ncgId, title) -> !movieTitleUtil.isTitleUnwanted(title) && ourMovies.firstOrNull { our -> our.sfId == ncgId } == null }
      .map { (ncgId, title, releaseDate, _, posterUrl) ->
        Movie(title = movieTitleUtil.trimTitle(title), sfId = ncgId, releaseDate = releaseDate, poster = posterUrl)
      }

    val savedEntities = movieRepo.saveAll(newMoviesWeHaventPreviouslySeen)
    log.info("Fetched ${savedEntities.count()} new movies from SF")

    asyncMovieUpdater.extendMovieInfo(savedEntities)
    return savedEntities.toList()
  }
}
