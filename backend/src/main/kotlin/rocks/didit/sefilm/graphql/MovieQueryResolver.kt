package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.services.MovieService
import java.util.*

@Component
class MovieQueryResolver(private val movieService: MovieService) : GraphQLQueryResolver {
  fun movie(id: UUID) = movieService.getMovie(id)
  fun allMovies() = movieService.allMovies()
  fun archivedMovies() = movieService.archivedMovies()
}


