@file:Suppress("unused")

package se.filmstund.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import se.filmstund.Properties
import se.filmstund.domain.dto.FilmstadenShowingDTO
import se.filmstund.domain.dto.core.MovieDTO
import se.filmstund.domain.id.MovieID
import se.filmstund.logger
import se.filmstund.services.MovieService
import se.filmstund.services.external.FilmstadenService
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

  private val log by logger()

  fun filmstadenShowings(movie: MovieDTO, city: String?, afterDate: LocalDate?): List<FilmstadenShowingDTO> {
    log.info(
      "Fetching Filmstaden showings after ${afterDate ?: "EPOCH"} in city=$city for '${movie.title}' (${movie.id}, ${movie.filmstadenId})"
    )
    if (movie.filmstadenId == null) return listOf()
    return filmstadenService.getShowingDates(movie.filmstadenId!!, city ?: properties.defaultCity)
      .filter {
        val after = (afterDate ?: LocalDate.MIN).atStartOfDay().toInstant(ZoneOffset.UTC)
        it.timeUtc.isAfter(after)
      }
  }
}


