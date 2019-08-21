@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.services.MovieService

@Component
class MovieMutationResolver(
        private val movieService: MovieService
) : GraphQLMutationResolver {

    fun fetchNewMoviesFromFilmstaden(): List<Movie> = movieService.fetchNewMoviesFromFilmstaden()
}