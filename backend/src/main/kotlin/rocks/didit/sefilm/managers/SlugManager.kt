package rocks.didit.sefilm.managers

import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.repositories.MovieRepository

@Component
class SlugManager(private val movieRepository: MovieRepository) {
  companion object {
    const val MAX_LENGTH = 45
  }

  fun generateSlugFor(movie: Movie): String = sluggifyString(movie.title)

  fun generateSlugFor(showing: Showing): String {
    if (showing.movieId == null) {
      throw IllegalArgumentException("Movie ID is null for showing ${showing.id}")
    }
    val movie = movieRepository.findById(showing.movieId)
      .orElseThrow { NotFoundException("movie ${showing.movieId}") }

    return sluggifyString(movie.originalTitle ?: movie.title)
  }

  private fun sluggifyString(str: String): String {
    return str.toLowerCase()
      .replace("-", "")
      .replace(" ", "-")
      .replace("'", "")
      .replace(":", "")
      .replace("å", "a")
      .replace("ä", "a")
      .replace("ö", "o")
      .replace("&", "and")
      .replace(",", "")
      .replace("ó", "o")
      .replace("é", "e")
      .trimToLength(MAX_LENGTH)
  }

  private fun String.trimToLength(length: Int): String {
    if (this.length <= length) {
      return this
    }
    return this.substring(0, SlugManager.MAX_LENGTH)
  }
}