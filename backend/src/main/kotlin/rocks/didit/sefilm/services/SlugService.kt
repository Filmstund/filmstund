package rocks.didit.sefilm.services

import org.springframework.stereotype.Service
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Showing

@Service
class SlugService {
  companion object {
    const val MAX_LENGTH = 45
  }

  fun generateSlugFor(movie: Movie): String = sluggifyString(movie.originalTitle ?: movie.title)

  fun generateSlugFor(showing: Showing): String {
    val movie = showing.movie
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
      .replace("®", "")
      .trimToLength(MAX_LENGTH)
  }

  private fun String.trimToLength(length: Int): String {
    if (this.length <= length) {
      return this
    }
    return this.substring(0, MAX_LENGTH)
  }
}