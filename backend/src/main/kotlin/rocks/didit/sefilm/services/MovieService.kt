package rocks.didit.sefilm.services

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.domain.dto.FilmstadenMovieDTO
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

    fun getMovie(movieId: UUID?): Movie? {
        if (movieId == null) return null
        return movieRepo.findById(movieId).orElse(null)
    }

    fun getMovieOrThrow(movieId: UUID?): Movie =
            getMovie(movieId).orElseThrow { NotFoundException("movie with id: $movieId") }

    fun movieExists(movieId: UUID): Boolean = movieRepo.existsById(movieId)

    /** Fetch new movies from Filmstaden, and trigger an async background update of the movies when done */
    fun fetchNewMoviesFromFilmstaden(): List<Movie> {
        val FilmstadenMovies = filmstadenService.allMovies()

        val ourMovies = movieRepo.findAll()
        val newMoviesWeHaventPreviouslySeen = FilmstadenMovies
                .filter {
                    filterUtil.isNewerThan(it)
                            && !filterUtil.isMovieUnwantedBasedOnGenre(it.genres.map { it.name })
                            && !filterUtil.isTitleUnwanted(it.title)
                            && ourMovies.isOtherMovieAlreadyKnown(it)
                }
                .map {
                    Movie(title = filterUtil.trimTitle(it.title),
                            filmstadenId = it.ncgId,
                            releaseDate = it.releaseDate,
                            poster = it.posterUrl,
                            filmstadenSlug = it.slug,
                            runtime = Duration.ofMinutes(it.length?.toLong() ?: 0L),
                            genres = it.genres.map { g -> g.name })
                }

        val savedEntities = movieRepo.saveAll(newMoviesWeHaventPreviouslySeen)
        log.info("Fetched ${savedEntities.count()} new movies from Filmstaden")

        asyncMovieUpdater?.extendMovieInfo(savedEntities)
        return savedEntities.sortedBy { it.releaseDate }
    }

    private fun Iterable<Movie>.isOtherMovieAlreadyKnown(other: FilmstadenMovieDTO) =
            this.firstOrNull { our -> our.filmstadenId == other.ncgId } == null
}
