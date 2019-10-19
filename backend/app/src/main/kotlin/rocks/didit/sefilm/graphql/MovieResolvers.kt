@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import com.coxautodev.graphql.tools.GraphQLResolver
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.domain.dto.FilmstadenShowingDTO
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.domain.id.MovieID
import rocks.didit.sefilm.services.MovieService
import rocks.didit.sefilm.services.external.FilmstadenService
import java.time.LocalDate
import java.time.ZoneOffset

@Component
class MovieQueryResolver(private val movieService: MovieService) : GraphQLQueryResolver {
  fun getMovie(id: MovieID) = movieService.getMovie(id)
  fun allMovies() = movieService.allMovies()
  fun archivedMovies() = movieService.archivedMovies()
}

@Component
class FilmstadenShowingResolver(
  private val filmstadenService: FilmstadenService,
  private val properties: Properties
) : GraphQLResolver<MovieDTO> {

  private val log: Logger = LoggerFactory.getLogger(FilmstadenShowingResolver::class.java)
  fun filmstadenShowings(movie: MovieDTO, city: String?, afterDate: LocalDate?): List<FilmstadenShowingDTO> {
    log.info(
      "Fetching Filmstaden showings after ${afterDate ?: "EPOCH"} in city=$city for '${movie.title}' (${movie.id})"
    )
    if (movie.filmstadenId == null) return listOf()
    return filmstadenService.getShowingDates(movie.filmstadenId!!, city ?: properties.defaultCity)
      .filter {
        val after = (afterDate ?: LocalDate.MIN).atStartOfDay().toInstant(ZoneOffset.UTC)
        it.timeUtc.isAfter(after)
      }
  }
}


