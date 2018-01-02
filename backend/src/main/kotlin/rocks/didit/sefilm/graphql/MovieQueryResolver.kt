package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.repositories.MovieRepository
import java.util.*

@Component
class MovieQueryResolver(private val movieRepository: MovieRepository) : GraphQLQueryResolver {
  fun movie(id: UUID): Movie? = movieRepository.findById(id).orElse(null)
  fun allMovies(): List<Movie> = movieRepository.findAll().toList()
}


