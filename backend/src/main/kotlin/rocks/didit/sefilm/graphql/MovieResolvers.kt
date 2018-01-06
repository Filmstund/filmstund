@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import com.coxautodev.graphql.tools.GraphQLResolver
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.domain.dto.SfShowingDTO
import rocks.didit.sefilm.services.MovieService
import rocks.didit.sefilm.services.SFService
import java.time.LocalDate
import java.time.ZoneOffset
import java.util.*

@Component
class MovieQueryResolver(private val movieService: MovieService) : GraphQLQueryResolver {
  fun getMovie(id: UUID) = movieService.getMovie(id)
  fun allMovies() = movieService.allMovies()
  fun archivedMovies() = movieService.archivedMovies()
}

@Component
class SfShowingResolver(
  private val sfService: SFService,
  private val properties: Properties) : GraphQLResolver<Movie> {

  private val log: Logger = LoggerFactory.getLogger(SfShowingResolver::class.java)
  fun sfShowings(movie: Movie, city: String?, afterDate: LocalDate?): List<SfShowingDTO> {
    log.info("Fetching SF showings after ${afterDate ?: "EPOCH"} in city=$city for '${movie.title}' (${movie.id})")
    if (movie.sfId == null) return listOf()
    return sfService.getShowingDates(movie.sfId, city ?: properties.defaultCity)
      .filter {
        val after = (afterDate ?: LocalDate.MIN).atStartOfDay().toInstant(ZoneOffset.UTC)
        it.timeUtc.isAfter(after)
      }
  }
}


