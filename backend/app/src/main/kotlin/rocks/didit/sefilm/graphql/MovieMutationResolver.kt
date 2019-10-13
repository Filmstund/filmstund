@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.services.MovieService

@Component
class MovieMutationResolver(
  private val movieService: MovieService
) : GraphQLMutationResolver {

  fun fetchNewMoviesFromFilmstaden(): List<MovieDTO> = movieService.fetchNewMoviesFromFilmstaden()
}