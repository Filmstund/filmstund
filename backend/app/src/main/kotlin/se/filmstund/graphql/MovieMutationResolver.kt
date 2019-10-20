@file:Suppress("unused")

package se.filmstund.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import se.filmstund.domain.dto.core.MovieDTO
import se.filmstund.services.MovieService

@Component
class MovieMutationResolver(
  private val movieService: MovieService
) : GraphQLMutationResolver {

  fun fetchNewMoviesFromFilmstaden(): List<MovieDTO> = movieService.fetchNewMoviesFromFilmstaden()
}